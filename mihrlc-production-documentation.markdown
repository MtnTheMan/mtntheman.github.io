---
layout: default
title: Michigan High Resolution Land Cover Production Documentation
permalink: /mihrlc-production-documentation/
excerpt: Production notes for the Michigan High Resolution Land Cover product, including the CNN model lineage, county fine-tuning workflow, product specifications, and references.
---

<style>
  #content table {
    border-collapse: collapse;
    display: block;
    margin: 1rem 0;
    max-width: 100%;
    overflow-x: auto;
    width: max-content;
  }

  #content th,
  #content td {
    border: 1px dotted #00FF00;
    padding: 0.45rem 0.55rem;
    text-align: left;
    vertical-align: top;
  }

  #content th {
    background-color: #252504;
  }

  #content img {
    box-sizing: border-box;
    display: block;
    height: auto;
    margin: 1rem 0;
    max-width: 100%;
  }

  .mihrlc-note {
    background-color: #252504;
    border: 2px dotted #00FF00;
    margin: 1rem 0;
    padding: 0.85rem;
  }

  .mihrlc-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 1rem 0 1.5rem;
  }

  .mihrlc-actions a {
    border: 2px outset #00FF00;
    padding: 0.4rem 0.6rem;
  }
</style>

# Michigan High Resolution Land Cover Production Documentation

The Michigan High Resolution Land Cover product, abbreviated here as MiHRLC, is a county-organized 0.6-meter land-cover map for Michigan derived primarily from 2022 four-band NAIP imagery. Production started with Esri's pretrained **High Resolution Land Cover Classification - USA** model, which was then fine-tuned for Michigan landscapes before the county GeoTIFFs were exported. [1]

![Michigan High Resolution Land Cover statewide mosaic and MSU-area detail](/assets/images/projects/mihrlc_presentation_preview_statewide_msu.png?v=bca9d65)

<div class="mihrlc-actions">
  <a href="/assets/maps/mihrlc-map.html">Open the interactive statewide map</a>
  <a href="/projects.html">Back to projects</a>
</div>

<div class="mihrlc-note">
  This page is a production-methods note, not an independent statewide accuracy assessment. It reconstructs the workflow from the MiHRLC archive, including model files, training histories, county rasters, and geoprocessing messages. Where the archive does not preserve a parameter or decision, the text identifies that gap rather than assigning a value.
</div>

## Product summary

| Item | Production value |
|---|---|
| Product name | Michigan High Resolution Land Cover (MiHRLC) |
| Spatial unit | County products, later assembled into statewide mosaics |
| Primary source imagery | 2022 NAIP county mosaics |
| Source imagery | Four-band, 8-bit unsigned imagery |
| Output resolution | 0.6 m pixels |
| Output format | One-band classified GeoTIFF products |
| Output data type | 8-bit unsigned integer |
| Output no-data value | 255 |
| Main projection observed | WGS 84 / UTM zone 16N |
| Final schema | Nine Chesapeake Bay Level-2 land-cover classes |

Production proceeded by county. Each county's imagery was mosaicked, classified, clipped to a buffered county boundary, assigned a standardized raster attribute table and color map, and exported as a county product. The county products were later used for statewide mosaics and web map tile experiments.

The final export folder contains 84 TIFF files because Roscommon has both version 2 and version 3 exports. A curated 83-county Michigan release should use the version 3 Roscommon file and omit version 2. The archive also contains two `MAC`-prefixed files for distinct county products; both need to retain their full county context during repackaging so that one is not mistaken for a duplicate.

## Class schema

MiHRLC follows the detailed Chesapeake Bay Level-2 land-cover schema documented for Esri's pretrained model. [2]

| Value | Class | Standard RGB |
|---:|---|---|
| 1 | Water | `0,197,255` |
| 2 | Wetlands | `0,168,132` |
| 3 | Tree Canopy | `38,115,0` |
| 4 | Shrubland | `76,230,0` |
| 5 | Low Vegetation | `163,255,115` |
| 6 | Barren | `255,170,0` |
| 7 | Structures | `255,0,0` |
| 8 | Impervious Surfaces | `156,156,156` |
| 9 | Impervious Roads | `0,0,0` |
| 255 | NoData / outside product footprint | Transparent or no-data |

Some web previews omit shrubland where it is absent or negligible in a given view. The production schema still reserves value 4 for shrubland.

## Base CNN lineage

MiHRLC starts from Esri's pretrained **High Resolution Land Cover Classification - USA** deep learning package rather than a CNN trained from scratch. Esri describes the model as a U-Net architecture implemented in ArcGIS API for Python, with output classes tied to the Chesapeake Bay 2013/2014 land-cover dataset. [1]

The Chesapeake Bay training lineage matters because it shaped both the class definitions and the model's initial learned representation of features such as water, wetlands, tree canopy, low vegetation, structures, roads, and impervious surfaces. The Chesapeake Bay Program land-cover production work used high-resolution NAIP imagery, LiDAR-derived height information, and planimetric data where available to create one-meter land-cover and land-use/land-cover products at regional scale. [4,5]

Esri reports that the pretrained model can be applied across the United States but is expected to perform best in the Chesapeake Bay region. Michigan's Great Lakes shoreline, northern forests, agricultural areas, seasonality, and 0.6-meter source imagery differ from that training geography and from the model's nominal imagery assumptions, which is why the MiHRLC workflow included Michigan-specific fine-tuning. [1,2]

### Base model reference metrics

Esri reports the following validation metrics for the pretrained model's nine-class output. These values describe the pretrained model before Michigan-specific fine-tuning; they should not be read as Michigan statewide accuracy values. [1]

| Class | Precision | Recall | F1 |
|---|---:|---:|---:|
| Water | 0.93614 | 0.93046 | 0.93329 |
| Wetlands | 0.81659 | 0.75905 | 0.78677 |
| Tree Canopy | 0.90477 | 0.93143 | 0.91791 |
| Shrubland | 0.51625 | 0.18643 | 0.27394 |
| Low Vegetation | 0.85977 | 0.86676 | 0.86325 |
| Barren | 0.67165 | 0.50922 | 0.57927 |
| Structures | 0.80510 | 0.84887 | 0.82641 |
| Impervious Surfaces | 0.73532 | 0.68556 | 0.70957 |
| Impervious Roads | 0.76281 | 0.81238 | 0.78682 |

The lowest base-model F1 scores are for shrubland and barren, with lower scores also reported for wetlands, impervious surfaces, and roads than for water or tree canopy. These values provide context for the Huron and Crawford fine-tuning results below; they do not measure MiHRLC performance in Michigan.

## CNN and training specifications

The archived Huron and Crawford model files record the following fine-tuned model structure.

| Parameter | Archived value |
|---|---|
| Model family | U-Net semantic image classifier |
| ArcGIS model name | `UnetClassifier` |
| Model configuration | `_unet` |
| Backend | PyTorch |
| Encoder/backbone | ResNet-34 |
| ArcGIS Learn version | `2.4.1.1` |
| Input bands | Four bands, `ExtractBands: [0, 1, 2, 3]` |
| Training chip size | 512 x 512 pixels |
| Cell size | 0.6 m |
| Image space | `MAP_SPACE` |
| Model tensor format | `NCHW` |
| Multispectral flag | `true` |
| Normalization | Per-band min, max, mean, and standard deviation |
| Learning rate schedule | `slice('7.5858e-06', '7.5858e-05', None)` |
| Inference function | `ArcGISImageClassifier.py` |
| Variable tile size support | `true` |

The model is an encoder-decoder CNN. The ResNet-34 encoder extracts image texture, color, shape, and contextual features from local NAIP image chips. The U-Net decoder projects those features back into a classified raster so each output pixel receives a land-cover class.

## Fine-tuning and inference parameters

The table separates MiHRLC values preserved in the archive from Esri's documented fine-tuning and inference guidance. Some interactive ArcGIS Pro inference arguments were not recorded, so those entries remain unknown.

| Workflow stage | Parameter | MiHRLC value or status | Esri guidance |
|---|---|---|---|
| Source imagery | Spatial resolution | 0.6 m | High-resolution imagery, generally 80-120 cm |
| Source imagery | Dynamic range | 8-bit unsigned | 8-bit unsigned |
| Source imagery | Bands | Four-band NAIP mosaics | General use page recommends three-band RGB |
| Training export | Image format | TIFF in preserved training metadata | TIFF |
| Training export | Tile size X/Y | 512 x 512 pixels | 512 x 512 pixels |
| Training export | Stride X/Y | Not preserved in local geoprocessing records | 0 / 0 |
| Training export | Metadata format | Classified Tiles | Classified Tiles |
| Training export | Cell size | 0.6 m | Desired cell size during export |
| Training labels | Class schema | Values 1-9 | Chesapeake Bay Level-2 classes |
| Fine-tuning | Pretrained model | High Resolution Land Cover Classification - USA `.dlpk` | Use Esri pretrained `.dlpk` |
| Fine-tuning | Batch size | Not preserved in archived `.emd` files | Example batch size 8, adjusted to GPU capacity |
| Fine-tuning | Max epochs | Huron ran 21 epochs; Crawford ran 52 epochs | Example maximum 100 with early stopping |
| Fine-tuning | Stop when model stops improving | Not documented; saved best-epoch histories do not establish whether early stopping was enabled | Checked in Esri workflow |
| Fine-tuning | Freeze model | Not explicitly preserved in archived `.emd` files | Checked in Esri workflow |
| Inference | Tool | `Classify Pixels Using Deep Learning` and ArcGIS raster function execution | `Classify Pixels Using Deep Learning` |
| Inference | Detailed classes | Nine-class Level-2 output | Default detailed output is nine classes |
| Inference | `tile_size`, `padding`, `batch_size`, `predict_background`, `test_time_augmentation` | Not fully preserved in archived logs | Optional inference arguments |
| Final clip | County boundary | Buffered county boundary, commonly 100 m | MiHRLC production choice |

Esri's documentation explains that padding can reduce tile-edge artifacts during inference and that batch size depends on available GPU memory. [2] It also documents the fine-tuning workflow using `Export Training Data For Deep Learning` followed by `Train Deep Learning Model`, with TIFF chips, 512 pixel tile size, stride 0, Classified Tiles metadata, early stopping, and a frozen pretrained model. [3]

### Training volume and runtime

The preserved training histories for Huron and Crawford include enough information to document training scale and runtime.

| Fine-tuned model | Training chips | Labeled features | Epochs | Best epoch | Approximate training time |
|---|---:|---:|---:|---:|---:|
| Huron coastal model | 47,834 | 1,970,506 | 21 | 14 | 19.03 hours |
| Crawford inland wooded model | 15,884 | 2,984,891 | 52 | 45 | 15.57 hours |

These are model-training runtimes only. End-to-end county production also included mosaic creation, inference, clipping, raster attribute-table work, GeoTIFF export, sidecar-file preservation, county packaging, statewide mosaicking, and web-tiling experiments.

## Regional fine-tuning counties

The archive documents distinct fine-tuning and production roles for three counties:

| County | Role in production documentation | Recovery status |
|---|---|---|
| Jackson | Early proof-of-concept and revised southern Lower Peninsula production county | Final product and geoprocessing evidence present; standalone saved model package not located |
| Huron | Coastal/agricultural/Great Lakes shoreline fine-tuning county | Full model package and training metadata present |
| Crawford | Inland/upland, predominantly wooded Northern Lower Peninsula fine-tuning county | Full model package and training metadata present |

Roscommon is also present in the final product archive, including later versioned outputs. Crawford provides the more complete wooded Northern Lower Peninsula model record because the archive contains its `.emd`, `.dlpk`, `.pth`, training statistics, and validation metrics.

### Jackson proof-of-concept county

The archive documents Jackson County in early proof-of-concept, revision, and southern Lower Peninsula production work. It contains the final Jackson product, `JAC_CLASS_v3_100mClip_Export1.tif`, along with an earlier small-batch package, `JacksonCounty_MiHRLC_v1.zip`.

Archive evidence includes:

- Four-band 0.6 m source county mosaic named `JAC_v1.tif`.
- Early class export named `JAC_CLASS_v1_Clip_Export_v1.tif`.
- Final class export named `JAC_CLASS_v3_100mClip_Export1.tif`.
- Final class export properties of one band, 0.6 m pixels, 8-bit unsigned integer data, and no-data value 255.
- ArcGIS geoprocessing messages from July 2, 2025 showing `ClassifyPixelsUsingDeepLearning` was invoked and aborted once, followed by two successful "Generate Raster from Raster Function" runs of roughly 70 minutes each.

No standalone Jackson `.emd`, `.dlpk`, or `.pth` model package was located. The documentation therefore treats Jackson as an early workflow and revision county, not as a preserved regional model package.

### Huron coastal model

The archive includes a complete Huron retraining package for coastal and agricultural conditions, including Great Lakes shoreline, wetlands, developed features, open fields, and woody cover.

The package contains:

- Training data folder named `HuronRetrainData`.
- Model folder named `HuronRetrainData_DLmodel`.
- Model definition file `HuronRetrainData_DLmodel.emd`.
- Deep learning package `HuronRetrainData_DLmodel.dlpk`.
- PyTorch weights file `HuronRetrainData_DLmodel.pth`.
- Final county export named `HUR_CLASS_v2_100mClip_Export1.tif`.

| Metric | Value |
|---|---:|
| Training chips | 47,834 |
| Labeled features | 1,970,506 |
| Epochs | 21 |
| Best epoch | 14 |
| Best validation loss | 0.106400445 |
| Best validation accuracy | 0.966542 |
| Best Dice score | 0.960452 |
| Last validation loss | 0.11581318 |
| Last validation accuracy | 0.964550 |
| Approximate training time | 19.03 hours |

| Class | F1 |
|---|---:|
| Water | 0.707 |
| Wetlands | 0.626 |
| Tree Canopy | 0.953 |
| Shrubland | 0.000 |
| Low Vegetation | 0.987 |
| Barren | 0.763 |
| Structures | 0.845 |
| Impervious Surfaces | 0.710 |
| Impervious Roads | 0.896 |

Huron's best validation accuracy was 0.9665 and its best Dice score was 0.9605. Class F1 was highest for low vegetation (0.987) and tree canopy (0.953), followed by impervious roads (0.896). Water (0.707) and wetlands (0.626) were lower, and shrubland scored 0.000 in this retrain.

### Crawford inland wooded model

The Crawford package documents fine-tuning for inland and upland wooded conditions in the Northern Lower Peninsula.

The package contains:

- Training data folder named `CrawfordTrainingData_v1`.
- Model folder named `CrawfordRe-Train`.
- Model definition file `CrawfordRe-Train.emd`.
- Deep learning package `CrawfordRe-Train.dlpk`.
- PyTorch weights file `CrawfordRe-Train.pth`.
- Final Crawford export named `CRA_CLASS_v3_100mClip_Export1.tif`.
- Related Roscommon final export named `ROS_CLASS_v3_100mClip_Export1.tif`.

| Metric | Value |
|---|---:|
| Training chips | 15,884 |
| Labeled features | 2,984,891 |
| Epochs | 52 |
| Best epoch | 45 |
| Best validation loss | 0.24815261 |
| Best validation accuracy | 0.924733 |
| Best Dice score | 0.928255 |
| Last validation loss | 0.24976693 |
| Last validation accuracy | 0.921307 |
| Approximate training time | 15.57 hours |

| Class | F1 |
|---|---:|
| Water | 0.825 |
| Wetlands | 0.431 |
| Tree Canopy | 0.969 |
| Shrubland | 0.096 |
| Low Vegetation | 0.854 |
| Barren | 0.631 |
| Structures | 0.696 |
| Impervious Surfaces | 0.658 |
| Impervious Roads | 0.819 |

Crawford's best validation accuracy was 0.9247 and its best Dice score was 0.9283. Tree canopy had the highest class F1 (0.969), followed by low vegetation (0.854), water (0.825), and impervious roads (0.819). Wetlands, barren, structures, impervious surfaces, and shrubland had lower class-level results.

## Production workflow

The archive documents a county-first ArcGIS Pro/Image Analyst workflow with eight stages:

### 1. Organize district and county workspaces

The source archive was organized by Michigan Department of Transportation-style district folders. Each district workspace generally included an ArcGIS Pro project, one or more geodatabases, source county NAIP mosaics, raster function templates, geoprocessing messages, versioned class rasters, and model or training folders where retraining occurred.

### 2. Build county NAIP mosaics

County-level source rasters were assembled from NAIP image tiles using ArcGIS `MosaicToNewRaster`. Source rasters such as `JAC_v1.tif`, `HUR_v1.tif`, `CRA_v1.tif`, and `ROS_v1.tif` are four-band, 0.6 m, 8-bit rasters.

| Example source raster | Bands | Pixel size | Data type | Reported NoData metadata |
|---|---:|---:|---|---:|
| `JAC_v1.tif` | 4 | 0.6 m | Byte | 256 |
| `HUR_v1.tif` | 4 | 0.6 m | Byte | 256 |
| `CRA_v1.tif` | 4 | 0.6 m | Byte | 256 |
| `ROS_v1.tif` | 4 | 0.6 m | Byte | 256 |

The archive reports 256 as NoData metadata even though Byte pixels can store only values from 0 through 255. Treat 256 as an out-of-range metadata setting rather than an in-band pixel value, and verify the original raster metadata before reprocessing these files.

### 3. Export or prepare training data

Fine-tuning used training chips and class labels compatible with the Chesapeake Bay Level-2 schema. The preserved Huron and Crawford training metadata indicate 512 x 512 pixel chips, map-space imagery, four input bands, 0.6 m cell size, TIFF imagery, and Classified Tiles metadata.

### 4. Fine-tune regional CNN models

Regional retraining adapted the base model to two Michigan settings represented in the preserved packages: Huron for coastal, agricultural, and shoreline conditions, and Crawford for inland and upland wooded conditions in the Northern Lower Peninsula. The archive documents Jackson as an early proof-of-concept and production revision county, but does not contain a standalone Jackson model package.

The preserved Huron and Crawford retraining folders include `.emd` model definitions, `.dlpk` deep-learning packages, `.pth` PyTorch weights, metrics HTML, loss graphs, and training-validation loss histories.

### 5. Classify county imagery

The archive contains ArcGIS raster-function records and `ClassifyPixelsUsingDeepLearning` messages, but not a complete scripted classifier run for every county. The available records are consistent with interactive processing in ArcGIS Pro/Image Analyst and confirm the U-Net model family and chip geometry.

### 6. Clip final county products

Final classified rasters were clipped using ArcGIS `ExtractByMask`. Most final products use a 100 m buffered county boundary and are named with `100mClip`; a smaller number are named simply with `Clip`.

Examples of final classified raster names include:

```text
JAC_CLASS_v3_100mClip
HUR_CLASS_v2_100mClip
CRA_CLASS_v3_100mClip
ROS_CLASS_v3_100mClip
VAN_CLASS_v2_Clip
```

The 100 m buffer means that a county product can include a narrow strip of neighboring land along county boundaries. That buffer is expected and should not be interpreted as a defect by itself.

### 7. Standardize raster attribute tables and colors

The export/recolor workflow standardized final class rasters by building raster attribute tables, adding or updating class-name and RGB fields, applying the standard MiHRLC color mapping, and exporting classified rasters to GeoTIFF with `CopyRaster`.

Tool-use counts recorded in the archive show the approximate scale of the final export workflow:

| ArcGIS tool | Archive count |
|---|---:|
| `MosaicToNewRaster` | 83 |
| `ExtractByMask` | 85 |
| `BuildRasterAttributeTable` | 85 |
| `AddField` | 340 |
| `CopyRaster` | 85 |
| `BuildPyramids` | 1 |

### 8. Export, package, mosaic, and publish derivatives

Final county products were exported as one-band Byte GeoTIFFs with sidecar files such as world files, auxiliary XML, and raster metadata XML. Earlier small-batch packages were also created for selected counties, including Jackson and St. Clair.

Statewide products were later assembled from the county rasters through batch mosaic scripts. Web delivery experiments rendered the county/classified products into raster map tiles and PMTiles archives for static object storage and Leaflet-based display.

## Output organization and archive notes

The final county products follow a versioned naming pattern:

```text
<COUNTY_PREFIX>_CLASS_v<version>_<clip_type>_Export<export_number>.tif
```

Typical examples:

```text
JAC_CLASS_v3_100mClip_Export1.tif
HUR_CLASS_v2_100mClip_Export1.tif
CRA_CLASS_v3_100mClip_Export1.tif
ROS_CLASS_v3_100mClip_Export1.tif
```

Each county GeoTIFF may be accompanied by sidecar files such as:

```text
.tfw
.tif.aux.xml
.tif.xml
```

Those sidecar files should be retained when preparing archival county packages because they preserve georeferencing and raster metadata used by desktop GIS software.

## Hardware and software environment

The preserved Huron and Crawford model packages report an ArcGIS Pro / ArcGIS Learn environment with ArcGIS Learn version `2.4.1.1`, PyTorch backend, and `ArcGISImageClassifier.py` for inference.

The archive does not identify the exact machine used for every original training and inference run. The workstation used during the 2026 recovery and documentation work had the following specifications; these should not be interpreted as the original production hardware:

| Component | Observed value |
|---|---|
| CPU | AMD Ryzen 9 7950X 16-Core Processor |
| Logical processors | 32 |
| System memory | Approximately 64 GiB installed |
| GPU | NVIDIA GeForce RTX 5080 |
| GPU memory | 16,303 MiB |
| NVIDIA driver | 610.62 |
| CUDA UMD version reported by `nvidia-smi` | 13.3 |

## Quality notes and limitations

The product should be interpreted with the following cautions:

- The Huron and Crawford metrics are model validation-chip metrics, not an independent statewide accuracy assessment.
- The Esri base model metrics describe the pretrained model, not Michigan statewide accuracy.
- The archive documents Jackson's role in production and revision work, but no standalone Jackson model package was located.
- Exact inference arguments such as tile size, padding, batch size, background prediction, and test-time augmentation were not fully preserved in the archived logs.
- Shrubland is retained in the class schema, but its class F1 is 0.000 for Huron and 0.096 for Crawford.
- Source-raster metadata reports NoData as 256 for Byte rasters. Because Byte pixels are limited to 0-255, this setting should be verified before the source rasters are reused.
- A 100 m county buffer means county products may include narrow slivers across county boundaries. That behavior is expected and was used to avoid edge effects along county product borders.

## Recommended citation

Hopkins, P. A. (2026). *Michigan High Resolution Land Cover Production Documentation*. Mtntheman.com. https://mtntheman.com/mihrlc-production-documentation/

## References

[1] Esri. (n.d.). *High Resolution Land Cover Classification - USA*. ArcGIS Living Atlas model item. Accessed July 20, 2026. <https://www.arcgis.com/home/item.html?id=a10f46a8071a4318bcc085dae26d7ee4>

[2] Esri. (n.d.). *Use the model: High Resolution Land Cover Classification - USA*. ArcGIS AI models documentation. Accessed July 20, 2026. <https://doc.arcgis.com/en/pretrained-models/latest/imagery/using-high-resolution-land-cover-classification-usa.htm>

[3] Esri. (n.d.). *Fine-tune the model: High Resolution Land Cover Classification - USA*. ArcGIS AI models documentation. Accessed July 20, 2026. <https://doc.arcgis.com/en/pretrained-models/latest/imagery/finetuning-the-high-resolution-land-cover-classification-usa.htm>

[4] Claggett, P., Ahmed, L., Buford, E., Czawlytko, J., MacFaden, S., McCabe, P., McDonald, S., O'Neill-Dunne, J., Royar, A., Schulze, K., Soobitsky, R., and Walker, K. (2022). *Chesapeake Bay Program's One-meter Resolution Land Use/Land Cover Data: Overview and Production*. Chesapeake Bay Program technical production document.

[5] Chesapeake Conservancy. (n.d.). *Chesapeake Bay Program Land Use/Land Cover Data Project*. Accessed July 20, 2026. <https://www.chesapeakeconservancy.org/projects/cbp-land-use-land-cover-data-project>
