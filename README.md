# pdf2audiobook

See this [video](https://www.youtube.com/watch?v=_JVRew5zXBQ) for learning how the tool works.

## pdf2audiobook training process

1. Create a training data as CSV file
2. Train a AutoML Tables model
3. use pdf2audiobook for generating mp3 files

## pdf2audiobook usage

Register the code with Cloud Functions the following command. You need to create the bucket beforehand as a workspace for pdf2audiobook.

`gcloud functions deploy p2a_gcs_trigger --runtime python37 --trigger-bucket <bucket> --memory=2048MB --timeout=540`

## Annotation

- Annotation mode usage: to use pdf2audiobook for generating annotation data, set `ANNOTATION_MODE = True` and re-register the code with Cloud Funtions, so the tool will generate CSV files for annotation instead of mp3 files.

- Annotation tool: use /apps-script code for running the annotation tool with Google Apps Script
1. Install Node.JS (version higher than 10.0.0) [Tutorial here](https://hackernoon.com/how-to-install-node-js-on-ubuntu-16-04-18-04-using-nvm-node-version-manager-668a7166b854 "hackernoon's Homepage") 
2. Install Google clasp (`sudo npm install @google/clasp -g`)
3. Go to script.google.com, specifically [https://script.google.com/home/usersettings],
4. Enable Google App Scripts API (`gcloud services enable cloudapis.googleapis.com`)
5. Run `clasp login`, `clasp push` in the /apps-script directory


