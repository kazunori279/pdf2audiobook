# PDF2Audiobook

Check out my [blog](https://konfido.github.io/Convert-PDFs-to-Audiobooks-with-Machine-Learning/) for step-by-step guide and learning how this tool works.

And see the original articles ([Kazunori](https://cloud.google.com/blog/ja/products/ai-machine-learning/practical-machine-learning-with-automl-series-3), [Morkowitz](https://daleonai.com/pdf-to-audiobook)) and videos ([Kazunori](https://www.youtube.com/watch?v=_JVRew5zXBQ), [Markowitz](https://www.youtube.com/watch?v=q-nvbuc59Po)) for reference.



## Main process

1. Set `ANNOTATION_MODE = True` (/functions) for generating annotation data
2. By default, the [pdfminer.six](https://github.com/pdfminer/pdfminer.six) is used to extract the content of pdf files, you can set `NO_OCR=False` to use Google OCR instead.
3. Use annotation tool (/apps-script) to create training data
4. Train a AutoML Tables model
5. Set `ANNOTATION_MODE = False` for generating mp3 files



## Deploy with command line

You can operate entirely in the web editors, but if you prefer registering and deploying with command line, use the following command. You need to create the bucket beforehand as a workspace for PDF2Audiobook.

`gcloud functions deploy <FUNCTION_NAME> --runtime python37 --trigger-bucket <BUCKET> --memory=2048MB --timeout=540`



