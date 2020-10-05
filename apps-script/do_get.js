/*
# Copyright 2020 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
*/

//
// config
//

var PDF_NAME = '<YOUR PDF FILE NAME>';
var BUCKET_NAME = '<YOUR BUCKET NAME>';
var SHEET_ID = '<YOUR SHEET ID>';

//
// init
//

var pdfId = PDF_NAME.replace('.pdf', '').substr(0,4);
var bucketUrl = 'https://storage.googleapis.com/' + BUCKET_NAME + '/';
var imageUrl = bucketUrl + pdfId + '-images/%%page%%.png';

function getSheetApp() {
  return SpreadsheetApp.openById(SHEET_ID);
}

function getSheet() {
  return getSheetApp().getSheetByName(pdfId);
}

function getHeaderList() {
  var sheet = getSheet();
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

//
// doGet
//

function doGet(e) {
  var html = HtmlService.createTemplateFromFile('index');
  return html.evaluate();
}

//
// RPCs
//

// returns image URL
function getImageUrl() {
  Logger.log('Image URL returned.');
  return imageUrl;
}

// download labels CSVs from GCS and create a Sheet
function downloadLabels() {

  // download all CSV files from GCS
  var csv = '';  
  for (var i = 1; true; i += 100) {    
    
    // build CSV URL like 'https://storage.googleapis.com/foo-bucket/foo-001-labels.csv'
    var batchId = pdfId + '-' + ('000' + i).slice(-3);
    var url = bucketUrl + batchId + '-labels.csv';
    
    // download the csv
    var resp = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
    if (resp.getResponseCode() == 200) {    
      csv += resp.getContentText('UTF-8');
    } else {
      break;
    }
  }
  
  // parse CSV
  var labelData = Utilities.parseCsv(csv);

  // rename old sheet if needed
  var oldSheet = getSheet();
  if (oldSheet) {
    oldSheet.setName(oldSheet.getName() + '.old.' + (new Date()).toLocaleTimeString())
  }

  // create new sheet and fill with the label data
  var sheet = getSheetApp().insertSheet();
  sheet.setName(pdfId);
  sheet.insertRows(1, labelData.length);
  sheet.getRange(1, 1, labelData.length, labelData[0].length).setValues(labelData);
  Logger.log('Labels CSV downloaded.');
}

// updates label on the sheet
function updateLabel(id, label) {
  var finder = getSheet().createTextFinder(id);
  var idRange = finder.findNext();
  var idRow = idRange.getRow();
  var labelColumn = getHeaderList().indexOf('label') + 1;
  var labelRange = getSheet().getRange(idRow, labelColumn);
  labelRange.setValue(label);
  labelRange.setBackground('wheat');
}

// returns paraDict as JSON encoded string
function getParaDict() {
  
  // check if the sheet is available
  if (getSheet() == null) {
    Logger.log('The sheet for ' + pdfId + ' is not available');
    return null;
  }

  // build paraDict
  var paraDict = buildParaDictFromSheet();
  
  // return as JSON string
  Logger.log('paraDict returned.');
  return JSON.stringify(paraDict);
}

function buildParaDictFromSheet() {  
  
  // read rows from the sheet
  var paraDict = new Object();
  var sheet = getSheet();
  var headerList = getHeaderList();
  var vals = sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  
  // build page dict
  var pageCount = 0;
  var paraCount = 0;
  vals.forEach(function(row) {
    
    // parse feature values
    var features = new Object();
    for (var i in row) {
      features[headerList[i]] = row[i];
    }
    
    // parse id
    var m = features.id.match(/(.*)-([0-9]+)-([0-9]+)/);
    if (!m) return;
    var pdfName = m[1];
    var page = m[2];
    var para = m[3];

    // add the features to the para dict
    if (!paraDict[page]) {
      paraDict[page] = [];
      pageCount++;
    }
    paraDict[page].push(features);
    
    // sort by the area size of para
    paraDict[page].sort(function (a, b) {
      return a.area < b.area ? 1 : (a.area == b.area ? 0 : -1);
    });
    paraCount++;
  });
  
  Logger.log('Built paraDict with ' + pageCount + ' pages, ' + paraCount + ' paragraphs.');
  return paraDict

}

