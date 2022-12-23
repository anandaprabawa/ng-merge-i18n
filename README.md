# Merge Angular Translation

Default Angular `extract-i18n` is just extracting the messages of the source locale.
You need to manually create files for the other locales.

This library will help you to create files of the other locales and merge the translations from the source.

## Features

- Currently support `json` format of the translation source.
- Create and update other translation files automatically.
- Remove source after translations have been merged.
- Sort translation messages by ascending.
- Remove unused translation messages.

## Installation

Install as a `devDependencies` by following command.

```bash
npm install ng-merge-i18n --save-dev
```

## Configuration

### Step 1

By default, `angular.json` has a builder target named `extract-i18n`. This library relies on it to get the options.
Make sure to specify the options `format` to `json` since we're currently support this format.

```json
{
  // ...
  "projects": {
    "project-name": {
      // ...
      "architect": {
        // ...
        "extract-i18n": {
          "builder": "@angular-devkit/build-angular:extract-i18n",
          "options": {
            "browserTarget": "project-name:build",
            "format": "json" // <-- Specify format to json
          }
        }
        // ...
      }
    }
  }
}
```

You can also define the other options such as `outputPath` and `outFile`. The library will detect those options to get the source file. If not provided, the default value of the `extract-i18n` will be used.

- `outputPath`, default to root directory of your project.
- `outFile`, default to `messages.[format]`, example: `messages.json`.

### Step 2

Define locales on `i18n` option in the project (see [Angular Internationalization](https://angular.io/guide/i18n-common-merge#define-locales-in-the-build-configuration) docs).
The translation targets will be placed based on the path you provide for each locale.

```json
{
  // ...
  "projects": {
    "project-name": {
      // ...
      "i18n": {
        "sourceLocale": "en-US", // <-- This is optional
        "locales": {
          "id": "assets/locales/id.json",
          "it": "assets/locales/it.json"
        }
      },
      "architect": {
        // ...
      }
    }
  }
}
```

Notes:

- For `json` format of the source file, the `locale` value will follows the locale key of the `locales`.

  For example, the locale keys from code example above are `id` and `it`.
  Then the locale value for each locale will use those keys on the translation target files.

  ```json
  // id.json file
  {
    "locale": "id",
    "translations": {}
  }
  // it.json file
  {
    "locale": "it",
    "translations": {}
  }
  ```

### Step 3

Add builder target for merging the translations. The builder name is "`ng-merge-i18n:merge`".
And the builder target name can be `"merge-i18n"` (recommended), but you can name it whatever you want.

```json
{
  // ...
  "projects": {
    "project-name": {
      // ...
      "architect": {
        // ...
        "merge-i18n": {
          "builder": "ng-merge-i18n:merge"
        }
      }
    }
  }
}
```

Additionally, you can provide the builder options to the target.

```json
{
  "merge-i18n": {
    "builder": "ng-merge-i18n:merge",
    "options": {
      // Provide options here. See available options below.
    }
  }
}
```


Available builder options:

| option          | default value    | description                                                                                                                                                             |
| --------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `builderTarget` | `"extract-i18n"` | Provide this option if you're changing the default `extract-i18n` builder target name.                                                                                  |
| `sort`          | `"push"`         | Sort translation messages in target translation files. <br/> Supported:<br/>- `"push"` (append new translation messages at the end).<br/>- `"asc"` (sort by id in ascending order). |
| `removeUnusedTranslation` | `false` | Whether to remove unused translation messages on the target translation files. |
| `removeSource` | `false` | Whether to remove the translation source file after translation messages have been merged. |

## Merge Translation

The translation source file need to be exist before merging the translations.
So, you need to extract i18n first then merge the translations.

Extract I18n:
```bash
npm run ng extract-i18n
```

Merge Translation:
Should provide the project name that run the target. The format is `"ng run [projectName]:merge-i18n"`.
```bash
npm run ng run project-name:merge-i18n
```

### Alternative Usage

Rather than run merge command manually, it can be used as post script in `package.json`.

```bash
{
  "scripts": {
    "extract-i18n": "ng extract-i18n",
    "postextract-i18n": "ng run project-name:merge-i18n"
  }
}
```

After extracting, it will merge the translations.
