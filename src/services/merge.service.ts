import { MergeAdapter, TransformMetadata } from "../interfaces/merge-adapter.interface";
import { SchemaData } from "../interfaces/schema-data.interface";
import { Translation, TranslationObject } from "../interfaces/translation.interface";
import { FileService } from "./file.service";

export class MergeService {
  private adapterInstance?: MergeAdapter;
  private readonly fileService = FileService;

  constructor(private schemaData: SchemaData, private translation: TranslationObject) {}

  /**
   * Which adapter to be used to merge the translation.
   * This method must be called before any other methods, otherwise it will throw an error.
   *
   * @param Adapter a class that implement {@link MergeAdapter} interface.
   */
  useAdapter(Adapter: new () => MergeAdapter): void {
    this.adapterInstance = new Adapter();
  }

  /**
   * Run the merge translation process.
   * Make sure to use adapter ({@link MergeService.useAdapter}) before calling this method.
   */
  async execute(): Promise<void> {
    this.checkAdapterExist();
    this.checkTranslationExist();

    const sourceContent = this.fileService.readFile(this.translation.source.fullPath);
    if (!sourceContent) {
      throw new Error(
        `Translation source does not exist.\nPath: ${this.translation.source.fullPath}`
      );
    }

    const promises = this.translation.targets.map((targetItem) =>
      this.mergeTranslation(sourceContent, this.translation.source, targetItem)
    );

    // Whether to remove the translation source after merged.
    // The value is based on the builder options.
    if (this.schemaData.removeSource) {
      this.fileService.removeFile(this.translation.source.fullPath);
    }

    await Promise.all(promises);
  }

  /**
   * Process merging translation.
   * @param sourceContent The content of the source translation.
   * @param sourceTranslation Metadata of the source translation.
   * @param targetTranslation Metadata of the target translation.
   * @returns void
   */
  private mergeTranslation(
    sourceContent: string,
    sourceTranslation: Translation,
    targetTranslation: Translation
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const targetContent = this.fileService.readFile(targetTranslation.fullPath);

        const defaultMetadata: TransformMetadata = {
          sourceTranslation,
          targetTranslation,
          isNew: false,
          sort: this.schemaData.sort,
          removeUnusedTranslation: this.schemaData.removeUnusedTranslation,
        };

        let mergedTranslation = "";
        if (!targetContent) {
          mergedTranslation = this.adapterInstance!.transform(sourceContent, sourceContent, {
            ...defaultMetadata,
            isNew: true,
          });
        } else {
          mergedTranslation = this.adapterInstance!.transform(
            sourceContent,
            targetContent,
            defaultMetadata
          );
        }

        // Create directory of the target translation if does not exist.
        this.fileService.mkdirOptional(targetTranslation.fullPath);

        this.fileService.writeFile(targetTranslation.fullPath, mergedTranslation);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private checkAdapterExist() {
    if (!this.adapterInstance) {
      throw new Error(
        'Adapter is not provided. Please use "useAdapter" method to assign a Adapter.'
      );
    }
  }

  private checkTranslationExist() {
    const hasTranslationSource = this.translation?.source;
    const hasTranslationTargets = this.translation?.targets?.length;
    if (!(hasTranslationSource && hasTranslationTargets)) {
      throw new Error("Does not have translation source and targets.");
    }
  }
}
