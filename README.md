# Advanced CSV Connector - C&M

Advanced CSV Connector is an extension of classic Akeneo CSV Connector. It allows to customize columns mapping on import or export with JSON as job parameter.

Made with :blue_heart: by C&M

## Installation

### Download the Bundle

```console
$ composer require clickandmortar/advanced-csv-connector-bundle
```

### Enable the Bundle

Enable the bundle by adding it to the list of registered bundles
in the `app/AppKernel.php` file of your project:

```php
<?php
// app/AppKernel.php

// ...
class AppKernel extends Kernel
{
    public function registerBundles()
    {
        $bundles = [
            // ...
            new ClickAndMortar\AdvancedCsvConnectorBundle\ClickAndMortarAdvancedCsvConnectorBundle(),
        ];

        // ...
    }

    // ...
}
```

## Usage

### Import

To create a new import job based on Advanced CSV connector, go to `Imports` part and create a new job with type `Import des produits avancé (CSV)`.
After job creation, go to edition mode and update `Mapping` parameter in global parameters tab.

Import mapping example:

```json
{
    "attributes": [
        {
            "attributeCode": "ean_code",
            "dataCode": "codeEan",
            "identifier": true
        },
        {
            "attributeCode": "lens_height",
            "dataCode": "hauteurVerre",
            "callback": "setMetricUnitAsSuffix"
        },
        {
            "attributeCode": "universe",
            "dataCode": "style",
            "onlyOnCreation": true,
            "locales": [
                "fr_FR",
                "en_GB"
            ]
        },
        {
            "attributeCode": "age_range",
            "dataCode": "trancheAge",
            "normalizerCallback": "getAgeRange"
        },
        {
            "attributeCode": "life_cycle",
            "dataCode": "idCycleVie",
            "defaultValue": "1"
        },
        {
            "attributeCode": "price-EUR",
            "dataCode": "prix"
        }
    ],
    "normalizers": [
            {
                "code": "getAgeRange",
                "values": [
                    {
                        "normalizedValue": "0-18",
                        "originalValues": [
                            "5",
                            "12"
                        ]
                    },
                    {
                        "normalizedValue": "18-35",
                        "originalValues": [
                            "19",
                            "26"
                        ]
                    },
                    {
                        "normalizedValue": "35-50",
                        "originalValues": [
                            "38"
                        ]
                    }
                ]
            }
        ],
    "completeCallback": "completeProductItem"
}
```

Mapping explanation:

* `identifier` (mandatory): Used to defined main identifier attribute of product
* `attributes` (mandatory): This is the default key that must contain mapping for all output/input attributes
* `attributeCode` (mandatory): The attribute code in your Akeneo project
* `dataCode` (mandatory): The column name in your file
* `callback`: The method name in your import helper to transform data from CSV file
* `defaultValue`: Default value for attribute if empty data in file
* `onlyOnCreation`: Set attribute value only if product is new (checked with `identifier` attribute)
* `locales`: Used to set same attribute value for different locales
* `completeCallback`: Used to add some more fields with **ImportHelper**

### Export

To create a new export job based on Advanced CSV connector, go to `Exports` part and create a new job with type `Export des produits avancé (CSV)`.
After job creation, go to edition mode and update `Mapping` parameter in global parameters tab.

Export mapping example:

```json
{
    "columns": [
        {
            "attributeCode": "sku",
            "columnName": "Code reference"
        },
        {
            "attributeCode": "ean_code",
            "columnName": "EAN Code",
            "forcedValue": "Same code"
        },
        {
            "attributeCode": "family_code",
            "columnName": "Family code",
            "normalizerCallback": "getNormalizedFamily"
        },
        {
            "attributeCode": "age_range",
            "columnName": "Age",
            "callback": "completeAgeRange"
        },
        {
            "attributeCode": "color",
            "columnName": "Couleur",
            "useLabel": true,
            "locale": "fr_FR"
        },
        {
            "attributeCode": "type",
            "columnName": "Type",
            "useReferenceLabel": "ClickAndMortarTypeBundle:Type",
            "locale": "fr_FR"
        },
        {
            "attributeCode": "brand",
            "columnName": "Marque",
            "capitalized": true
        },
        {
            "attributeCode": "label",
            "columnName": "Libellé",
            "maxLength": 50
        },
        {
            "attributeCode": "price-EUR",
            "columnName": "Prix (EUR)",
            "defaultValue": "0.00"
        }
    ],
    "normalizers": [
        {
            "code": "getNormalizedFamily",
            "values": [
                {
                    "normalizedValue": "Man",
                    "originalValues": [
                        "12",
                        "121",
                        "122"
                    ]
                }
            ]
        }
    ],
    "replacements": [
        {
            "values": [
                "!"
            ],
            "newValue": "!!!"
        }
    ],
    "additionalColumns": [
        {
            "columnName": "Additional column",
            "value": "Same content"
        }
    ],
    "additionalHeadersLine": {
        "Code reference": "My code reference",
        "EAN Code": "EAN technical code"
    },
    "completeCallback": "completeProductColumns"
}
```

Mapping explanation:

* `columns` (mandatory): Contains all columns mapping for export
  * `attributeCode` (mandatory): Attribute code in Akeneo for column mapping
  * `columnName`: Custom column name in CSV exported file
  * `forcedValue`: Force a value
  * `normalizerCallback`: Normalizer code to update value from Akeneo
  * `callback`: Method name in **ExportHelper** to update value from Akeneo
  * `useLabel`: Boolean to get the label associated to the code given
  * `useReferenceLabel`: Takes the entity path of a customed entity to get the label associated to the code given
  * `locale`: Select a specific locale for the label to export from the **useLabel** and **useReferenceLabel** methods
  * `capitalized`: Capitalize the value
  * `maxLength`: Integer use to shorten attribute value if necessary
  * `defaultValue`: Default value for column if empty attribute value
* `normalizers`: List of available normalizers used in mapping
* `replacements`: Replace **values** by **newValue** in all columns
* `additionalColumns`: Force static columns in CSV exported file
* `additionalHeadersLine`: Allow to add second headers line with mapping of original headers line
* `completeCallback`: Complete product item with callback method defined in **ExportHelper**
