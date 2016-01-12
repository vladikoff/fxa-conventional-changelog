'use strict';

var compareFunc = require('compare-func');
var readFileSync = require('fs').readFileSync;
var resolve = require('path').resolve;
var semver = require('semver');
var map = require('lodash.map');

function presetOpts() {
  var parserOpts = {
    headerPattern: /^(\w*)(?:\((.*)\))?\: (.*)$/,
    headerCorrespondence: [
      'type',
      'scope',
      'subject'
    ],
    noteKeywords: 'BREAKING CHANGE',
    revertPattern: /^revert:\s([\s\S]*?)\s*This reverts commit (\w*)\./,
    revertCorrespondence: ['header', 'hash']
  };

  var writerOpts = {
    transform: function(commit) {
      if (commit.type === 'feat') {
        commit.type = 'Features';
      } else if (commit.type === 'fix') {
        commit.type = 'Bug Fixes';
      } else if (commit.type === 'perf') {
        commit.type = 'Performance Improvements';
      } else if (commit.type === 'revert') {
        commit.type = 'Reverts';
      } else if (commit.type === 'refactor') {
        commit.type = 'Refactor';
      } else {
        return;
      }

      if (commit.scope === '*') {
        commit.scope = '';
      }

      if (typeof commit.hash === 'string') {
        commit.hash = commit.hash.substring(0, 7);
      }

      if (typeof commit.subject === 'string') {
        commit.subject = commit.subject.substring(0, 80);
      }

      map(commit.notes, function(note) {
        if (note.title === 'BREAKING CHANGE') {
          note.title = 'BREAKING CHANGES';
        }

        return note;
      });

      return commit;
    },
    groupBy: 'type',
    commitGroupsSort: 'title',
    commitsSort: ['scope', 'subject'],
    noteGroupsSort: 'title',
    notesSort: compareFunc,
    generateOn: function(commit) {
      return semver.valid(commit.version);
    }
  };

  writerOpts.mainTemplate = readFileSync(resolve(__dirname, 'templates/template.hbs'), 'utf-8');
  writerOpts.headerPartial = readFileSync(resolve(__dirname, 'templates/header.hbs'), 'utf-8');
  writerOpts.commitPartial = readFileSync(resolve(__dirname, 'templates/commit.hbs'), 'utf-8');
  writerOpts.footerPartial = readFileSync(resolve(__dirname, 'templates/footer.hbs'), 'utf-8');

  return {
    parserOpts: parserOpts,
    writerOpts: writerOpts
  };
}

module.exports = presetOpts;
