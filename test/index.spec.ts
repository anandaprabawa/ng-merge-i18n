import { Architect, BuilderOutput } from "@angular-devkit/architect";
import { TestingArchitectHost } from "@angular-devkit/architect/testing";
import { schema } from "@angular-devkit/core";
import { join } from "path";
import { CURRENT_DIR, WORKSPACE_DIR } from "./conf";
import { mockExtractI18n } from "./utils/mock-extract-i18n";
import { extractI18nMessage } from "./utils/extract-i18n-message";
import { SchemaData } from "../src/interfaces/schema-data.interface";
import { TranslationJson } from "./utils/translation-json";
import { FileResult } from "./utils/file-result";

describe("Builder", () => {
  let architectHost: TestingArchitectHost;
  let architect: Architect;

  beforeEach(() => {
    FileResult.removeResultDir();
  });

  beforeEach(async () => {
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    architectHost = new TestingArchitectHost(WORKSPACE_DIR, CURRENT_DIR);
    architect = new Architect(architectHost, registry);

    await architectHost.addBuilderFromPackage(join(__dirname, ".."));
    architectHost.addTarget({ project: "test", target: "merge-i18n" }, "ng-merge-i18n:merge");
  });

  afterAll(() => {
    FileResult.removeResultDir();
  });

  describe("extract-i18n target", () => {
    it("should fail if does not exist", async () => {
      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" });
      const output = await run.result;
      await run.stop();

      expect(output.success).toBeFalse();
      expect(output.error).toBe("Builder target for extracting i18n does not found.");
    });

    it("should fail if format is not supported", async () => {
      mockExtractI18n(architectHost, { builderOptions: { format: "xmd" } });

      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" });
      const output = await run.result;
      await run.stop();

      expect(output.success).toBeFalse();
      expect(output.error).toBe("Translation file format is not supported.");
    });

    it("should fail if target name is different (not extract-i18n)", async () => {
      mockExtractI18n(architectHost, {
        builderOptions: { format: "xmd" },
        targetName: "extract-message",
      });

      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" });
      const output = await run.result;
      await run.stop();

      expect(output.success).toBeFalse();
      expect(output.error).toBe("Builder target for extracting i18n does not found.");
    });
  });

  describe("i18n option", () => {
    it("should fail if does not exist", async () => {
      mockExtractI18n(architectHost, { builderOptions: { format: "json" } });
      spyOn(architectHost, "getProjectMetadata").withArgs("test").and.resolveTo({});

      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" });
      const output = await run.result;
      await run.stop();

      expect(output.success).toBeFalse();
      expect(output.error).toBe('"i18n" project option does not provided in the "angular.json".');
    });
  });

  describe("create translation targets", () => {
    let output: BuilderOutput;

    beforeEach(async () => {
      mockExtractI18n(architectHost, { builderOptions: { format: "json" } });

      spyOn(architectHost, "getProjectMetadata")
        .withArgs("test")
        .and.resolveTo({ i18n: { locales: { id: "id.json", it: "it.json" } } });

      extractI18nMessage(architectHost, TranslationJson.createExtractI18nFileContent);

      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" });
      output = await run.result;
      await run.stop();
    });

    it("should success", () => {
      expect(output.success).toBeTrue();
      expect(output.error).toBeUndefined();
    });

    it("should create new files", () => {
      expect(FileResult.isExist("id.json")).toBeTrue();
      expect(FileResult.isExist("it.json")).toBeTrue();
    });

    it("should have different locale based on the target locale", () => {
      const contentID = JSON.parse(FileResult.readFile("id.json"));
      const contentIT = JSON.parse(FileResult.readFile("it.json"));
      expect(contentID.locale).toBe("id");
      expect(contentIT.locale).toBe("it");
    });

    it("should have same translations as the source", () => {
      const sourceContent = JSON.parse(FileResult.readFile("messages.json"));
      const contentID = JSON.parse(FileResult.readFile("id.json"));
      const contentIT = JSON.parse(FileResult.readFile("it.json"));
      expect(contentID.translations).toEqual(sourceContent.translations);
      expect(contentIT.translations).toEqual(sourceContent.translations);
    });
  });

  describe("update translation targets", () => {
    let output: BuilderOutput;

    beforeEach(async () => {
      mockExtractI18n(architectHost, { builderOptions: { format: "json" } });

      spyOn(architectHost, "getProjectMetadata")
        .withArgs("test")
        .and.resolveTo({ i18n: { locales: { id: "id.json", it: "it.json" } } });

      extractI18nMessage(architectHost, TranslationJson.createExtractI18nFileContent);

      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" });
      output = await run.result;
      await run.stop();
    });

    it("should success", () => {
      expect(output.success).toBeTrue();
      expect(output.error).toBeUndefined();
    });

    it("should add new missing translations from source", async () => {
      TranslationJson.addAdditionalTranslationsOnFile("messages.json", { new: "New" });
      // The translations targets should not have new translations from the source.
      const contentID = JSON.parse(FileResult.readFile("id.json"));
      const contentIT = JSON.parse(FileResult.readFile("it.json"));
      expect(contentID.translations["new"]).toBeUndefined();
      expect(contentIT.translations["new"]).toBeUndefined();
      // Do merge to update the translation targets.
      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" });
      await run.stop();
      // The translations targets should have new translations from the source.
      const updatedContentID = JSON.parse(FileResult.readFile("id.json"));
      const updatedContentIT = JSON.parse(FileResult.readFile("it.json"));
      expect(updatedContentID.translations["new"]).toBeTruthy();
      expect(updatedContentIT.translations["new"]).toBeTruthy();
    });

    it("should not replace existing translation value on the target", async () => {
      TranslationJson.changeTranslationsOnFile("id.json", { welcome: "Selamat datang" });
      // Merge translations.
      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" });
      await run.stop();

      const content = JSON.parse(FileResult.readFile("id.json"));
      expect(content.translations["welcome"]).toBe("Selamat datang");
    });
  });

  describe("unused translations", () => {
    beforeEach(async () => {
      mockExtractI18n(architectHost, { builderOptions: { format: "json" } });

      spyOn(architectHost, "getProjectMetadata")
        .withArgs("test")
        .and.resolveTo({ i18n: { locales: { id: "id.json" } } });

      extractI18nMessage(architectHost, TranslationJson.createExtractI18nFileContent);

      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" });
      await run.stop();
    });

    it('should not be removed if "removeUnusedTranslation" option if false (default)', async () => {
      TranslationJson.addAdditionalTranslationsOnFile("id.json", { new: "New" });
      // Merge translations.
      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" });
      await run.stop();

      const content = JSON.parse(FileResult.readFile("id.json"));
      expect(content.translations["new"]).toBe("New");
    });

    it('can be removed if "removeUnusedTranslation" option is true', async () => {
      TranslationJson.addAdditionalTranslationsOnFile("id.json", { new: "New" });
      // Merge translations with option `removeUnusedTranslation` true.
      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" }, {
        removeUnusedTranslation: true,
      } as Partial<SchemaData>);
      await run.stop();

      const content = JSON.parse(FileResult.readFile("id.json"));
      expect(content.translations["new"]).toBeFalsy();
    });
  });

  describe("sort", () => {
    beforeEach(async () => {
      mockExtractI18n(architectHost, { builderOptions: { format: "json" } });

      spyOn(architectHost, "getProjectMetadata")
        .withArgs("test")
        .and.resolveTo({ i18n: { locales: { id: "id.json" } } });

      extractI18nMessage(architectHost, TranslationJson.createExtractI18nFileContent);

      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" });
      await run.stop();
    });

    it("should be default to push on the bottom", async () => {
      TranslationJson.addAdditionalTranslationsOnFile("id.json", { new: "New", newTwo: "New Two" });

      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" });
      await run.stop();

      const content = JSON.parse(FileResult.readFile("id.json"));
      expect(Object.keys(content.translations)[4]).toBe("new");
      expect(content.translations.new).toBe("New");
      expect(Object.keys(content.translations)[5]).toBe("newTwo");
      expect(content.translations.newTwo).toBe("New Two");
    });

    it("can be sorted by ascending order", async () => {
      TranslationJson.addAdditionalTranslationsOnFile("id.json", { new: "New" });

      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" }, {
        sort: "asc",
      } as Partial<SchemaData>);
      await run.stop();

      const content = JSON.parse(FileResult.readFile("id.json"));
      expect(Object.keys(content.translations)[0]).toBe("new");
      expect(content.translations["new"]).toBe("New");

      expect(Object.keys(content.translations)[1]).toBe("page.login.description");
      expect(content.translations["page.login.description"]).toBe("Please login");

      expect(Object.keys(content.translations)[2]).toBe("page.login.title");
      expect(content.translations["page.login.title"]).toBe("Login");

      expect(Object.keys(content.translations)[3]).toBe("title");
      expect(content.translations["title"]).toBe("Title");

      expect(Object.keys(content.translations)[4]).toBe("welcome");
      expect(content.translations["welcome"]).toBe("Welcome");
    });
  });

  describe("translation source", () => {
    beforeEach(async () => {
      mockExtractI18n(architectHost, { builderOptions: { format: "json" } });

      spyOn(architectHost, "getProjectMetadata")
        .withArgs("test")
        .and.resolveTo({ i18n: { locales: { id: "id.json" } } });

      extractI18nMessage(architectHost, TranslationJson.createExtractI18nFileContent);
    });

    it("should not be removed (default)", async () => {
      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" });
      await run.stop();

      const fileExist = FileResult.isExist("messages.json");
      expect(fileExist).toBeTrue();
    });

    it("can be removed after merging translations", async () => {
      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" }, {
        removeSource: true,
      } as Partial<SchemaData>);
      await run.stop();

      const fileExist = FileResult.isExist("messages.json");
      expect(fileExist).toBeFalse();
    });
  });

  describe("target", () => {
    it('can merge using different "extract-i18n" builder target name', async () => {
      mockExtractI18n(architectHost, {
        builderOptions: { format: "json" },
        targetName: "extract-message",
      });

      spyOn(architectHost, "getProjectMetadata")
        .withArgs("test")
        .and.resolveTo({ i18n: { locales: { id: "id.json" } } });

      extractI18nMessage(architectHost, TranslationJson.createExtractI18nFileContent, {
        targetName: "extract-message",
      });

      const run = await architect.scheduleTarget({ project: "test", target: "merge-i18n" }, {
        builderTarget: "extract-message",
      } as Partial<SchemaData>);
      const output = await run.result;
      await run.stop();

      expect(output.success).toBeTrue();
      expect(output.error).toBeUndefined();
    });
  });
});
