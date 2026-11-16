/*
    JavaScript autoComplete v1.0.4+
        McShelby/hugo-theme-relearn#155
            - PR #46, PR #75: introducing selectorToInsert and anchor to it
            - sticky dropdown on scrolling
        McShelby/hugo-theme-relearn#387
            - don't empty search input if no data-val is given
            - don't delete search term but close suggestions when suggestions are open
            - delete search term when suggestions are closed
        McShelby/hugo-theme-relearn#452
            - register focus event ignoring minChars because that doesn't make sense
        McShelby/hugo-theme-relearn#452
            - on ESC, close overlay without deleting search term if overlay is open
            - on ESC, delete search term if overlay is closed
            - on UP, preventDefault to keep cursor in position
        McShelby/hugo-theme-relearn#1258
            - tell assistive technology about the combobox, its list, its options and their state
        McShelby/hugo-theme-relearn#1304
            - name the list by the aria-label of the input, if it has one
            - number the lists, so their ids don't depend on the id of the input
            - insert the list into the closest ancestor of the input matching selectorToInsert
        McShelby/hugo-theme-relearn#1355
            - limit the height of the list to the visible part of the window below it

    Copyright (c) 2014 Simon Steinberger / Pixabay
    GitHub: https://github.com/Pixabay/JavaScript-autoComplete
    License: http://www.opensource.org/licenses/mit-license.php
*/

var autoComplete = (function(){
    // "use strict";
    var instances = 0;
    function autoComplete(options){
        if (!document.querySelector) return;

        // helpers
        function hasClass(el, className){ return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className); }

        function addEvent(el, type, handler){
            if (el.attachEvent) el.attachEvent('on'+type, handler); else el.addEventListener(type, handler);
        }
        function removeEvent(el, type, handler){
            if (el.detachEvent) el.detachEvent('on'+type, handler); else el.removeEventListener(type, handler);
        }
        function live(elClass, event, cb, context){
            addEvent(context || document, event, function(e){
                var found, el = e.target || e.srcElement;
                while (el && !(found = hasClass(el, elClass))) el = el.parentElement;
                if (found) cb.call(el, e);
            });
        }

        var o = {
            selector: 0,
            source: 0,
            minChars: 3,
            delay: 150,
            offsetLeft: 0,
            offsetTop: 1,
            cache: 1,
            menuClass: '',
            selectorToInsert: 0,
            renderItem: function (item, search){
                // escape special characters
                search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
                return '<div class="autocomplete-suggestion" data-val="' + item + '">' + item.replace(re, "<b>$1</b>") + '</div>';
            },
            onSelect: function(e, term, item){}
        };
        for (var k in options) { if (options.hasOwnProperty(k)) o[k] = options[k]; }

        // init
        var elems = typeof o.selector == 'object' ? [o.selector] : document.querySelectorAll(o.selector);
        for (var i=0; i<elems.length; i++) {
            var that = elems[i];

            // create suggestions container "sc"
            that.sc = document.createElement('div');
            that.sc.className = 'autocomplete-suggestions '+o.menuClass;

            that.autocompleteAttr = that.getAttribute('autocomplete');
            that.setAttribute('autocomplete', 'off');
            that.cache = {};
            that.last_val = '';

            // the input and its suggestions are a combobox and its list
            that.sc.id = 'autocomplete-' + (++instances) + '-suggestions';
            that.sc.setAttribute('role', 'listbox');
            var label = that.getAttribute('aria-label') || (that.labels && that.labels.length ? that.labels[0].textContent.replace(/^\s+|\s+$/g, '') : '');
            if (label) that.sc.setAttribute('aria-label', label);
            that.setAttribute('role', 'combobox');
            that.setAttribute('aria-autocomplete', 'list');
            that.setAttribute('aria-controls', that.sc.id);
            that.setAttribute('aria-expanded', 'false');
            var hide = function(){
                that.sc.style.display = 'none';
                that.setAttribute('aria-expanded', 'false');
                that.removeAttribute('aria-activedescendant');
            };
            var select = function(el){
                el.className += ' selected';
                el.setAttribute('aria-selected', 'true');
                that.setAttribute('aria-activedescendant', el.id);
            };
            var deselect = function(el){
                el.className = el.className.replace('selected', '');
                el.setAttribute('aria-selected', 'false');
                if (that.getAttribute('aria-activedescendant') == el.id) that.removeAttribute('aria-activedescendant');
            };

			var parentElement;
            if (typeof o.selectorToInsert === "string") {
                var insertInto = that.closest(o.selectorToInsert) || document.querySelector(o.selectorToInsert);
                if (insertInto instanceof HTMLElement) parentElement = insertInto;
			}
			that.updateSC = function(resize, next){
                var rect = that.getBoundingClientRect();
				var parentOffsetLeft = 0;
                var parentOffsetTop = 0;
                var pageXOffset = 0;
                var pageYOffset = 0;
                if (parentElement != false) {
                    parentOffsetLeft = parentElement.getBoundingClientRect().left;
                    parentOffsetTop = parentElement.getBoundingClientRect().top;
                } else {
                    pageXOffset = window.pageXOffset || document.documentElement.scrollLeft;
                    pageYOffset = window.pageYOffset || document.documentElement.scrollTop;
                }
                // Is this really the job of the tool or should it be deferred to the user?
                // that.sc.style.left = Math.round(rect.left + pageXOffset + o.offsetLeft - parentOffsetLeft) + 'px';
                // that.sc.style.top = Math.round(rect.bottom + pageYOffset + o.offsetTop - parentOffsetTop) + 'px';
                // that.sc.style.width = Math.round(rect.right - rect.left) + 'px'; // outerWidth
                if (!resize) {
                    that.sc.style.display = 'block';
                    that.setAttribute('aria-expanded', 'true');
                    fit();
                    that.sc.maxHeight = parseInt((window.getComputedStyle ? getComputedStyle(that.sc, null) : that.sc.currentStyle).maxHeight);
                    if (!that.sc.suggestionHeight) that.sc.suggestionHeight = that.sc.querySelector('.autocomplete-suggestion').offsetHeight;
                    if (that.sc.suggestionHeight)
                        if (!next) that.sc.scrollTop = 0;
                        else {
                            var scrTop = that.sc.scrollTop, selTop = next.getBoundingClientRect().top - that.sc.getBoundingClientRect().top;
                            if (selTop + that.sc.suggestionHeight - that.sc.maxHeight > 0)
                                that.sc.scrollTop = selTop + that.sc.suggestionHeight + scrTop - that.sc.maxHeight;
                            else if (selTop < 0)
                                that.sc.scrollTop = selTop + scrTop;
                        }
                }
                else if (that.sc.style.display == 'block') fit();
            }
            // the window may be partly covered, eg. by a virtual keyboard, so
            // only the visible part of it below the list is free for the list
            var fit = function(){
                var viewport = window.visualViewport;
                that.sc.style.setProperty('--autocomplete-visible-height', Math.floor(viewport.offsetTop + viewport.height - that.sc.getBoundingClientRect().top) + 'px');
            };
            addEvent(window, 'resize', that.updateSC);
            addEvent(window.visualViewport, 'resize', that.updateSC);
            addEvent(window.visualViewport, 'scroll', that.updateSC);

            if (parentElement) {
                parentElement.appendChild(that.sc);
            } else {
                document.body.appendChild(that.sc);
            }

            live('autocomplete-suggestion', 'mouseleave', function(e){
                var sel = that.sc.querySelector('.autocomplete-suggestion.selected');
                if (sel) setTimeout(function(){ deselect(sel); }, 20);
            }, that.sc);

            live('autocomplete-suggestion', 'mouseover', function(e){
                var sel = that.sc.querySelector('.autocomplete-suggestion.selected');
                if (sel) deselect(sel);
                select(this);
            }, that.sc);

            live('autocomplete-suggestion', 'mousedown', function(e){
                if (hasClass(this, 'autocomplete-suggestion')) { // else outside click
                    var v = this.getAttribute('data-val');
                    that.value = v;
                    o.onSelect(e, v, this);
                    hide();
                }
            }, that.sc);

            that.blurHandler = function(){
                try { var over_sb = document.querySelector('.autocomplete-suggestions:hover'); } catch(e){ var over_sb = 0; }
                if (!over_sb) {
                    that.last_val = that.value;
                    hide();
                    setTimeout(function(){ hide(); }, 350); // hide suggestions on fast input
                } else if (that !== document.activeElement) setTimeout(function(){ that.focus(); }, 20);
            };
            addEvent(that, 'blur', that.blurHandler);

            var suggest = function(data){
                var val = that.value;
                that.cache[val] = data;
                if (data.length && val.length >= o.minChars) {
                    var s = '';
                    for (var i=0;i<data.length;i++) s += o.renderItem(data[i], val);
                    that.sc.innerHTML = s;
                    var items = that.sc.querySelectorAll('.autocomplete-suggestion');
                    for (var j=0;j<items.length;j++) {
                        items[j].id = that.sc.id + '-' + j;
                        items[j].setAttribute('role', 'option');
                        items[j].setAttribute('aria-selected', 'false');
                    }
                    that.removeAttribute('aria-activedescendant');
                    that.updateSC(0);
                }
                else
                    hide();
            }

            that.keydownHandler = function(e){
                var key = window.event ? e.keyCode : e.which;
                // down (40), up (38)
                if ((key == 40 || key == 38) && that.sc.innerHTML) {
                    e.preventDefault();
                    var next, sel = that.sc.querySelector('.autocomplete-suggestion.selected');
                    if (!sel) {
                        next = (key == 40) ? that.sc.querySelector('.autocomplete-suggestion') : that.sc.childNodes[that.sc.childNodes.length - 1]; // first : last
                        select(next);
                        if (next.getAttribute('data-val')) that.value = next.getAttribute('data-val');
                    } else {
                        next = (key == 40) ? sel.nextSibling : sel.previousSibling;
                        if (next) {
                            deselect(sel);
                            select(next);
                            if (next.getAttribute('data-val')) that.value = next.getAttribute('data-val');
                        }
                        else {
                            deselect(sel);
                            that.value = that.last_val;
                            next = 0;
                        }
                    }
                    that.updateSC(0, next);
                    return false;
                }
                // esc
                else if (key == 27) {
                    if (that.sc.style.display != 'none') {
                        // just close the overlay if it's open, and prevent other listeners
                        // from recognizing it; this is not for you!
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        hide();
                        var sel = that.sc.querySelector('.autocomplete-suggestion.selected');
                        if (sel) {
                            that.focus();
                        }
                    }
                    else {
                        // if no overlay is open, we want to remove the search term and also
                        // want other listeners to recognize it
                        that.value = '';
                    }
                }
                // enter
                else if (key == 13 || key == 9) {
                    var sel = that.sc.querySelector('.autocomplete-suggestion.selected');
                    if (sel && that.sc.style.display != 'none') { o.onSelect(e, sel.getAttribute('data-val'), sel); setTimeout(function(){ hide(); }, 20); }
                }
            };
            addEvent(that, 'keydown', that.keydownHandler);

            that.keyupHandler = function(e){
                var key = window.event ? e.keyCode : e.which;
                if (!key || (key < 35 || key > 40) && key != 13 && key != 27) {
                    var val = that.value;
                    if (val.length >= o.minChars) {
                        if (val != that.last_val) {
                            that.last_val = val;
                            clearTimeout(that.timer);
                            if (o.cache) {
                                if (val in that.cache) { suggest(that.cache[val]); return; }
                                // no requests if previous suggestions were empty
                                for (var i=1; i<val.length-o.minChars; i++) {
                                    var part = val.slice(0, val.length-i);
                                    if (part in that.cache && !that.cache[part].length) { suggest([]); return; }
                                }
                            }
                            that.timer = setTimeout(function(){ o.source(val, suggest) }, o.delay);
                        }
                    } else {
                        that.last_val = val;
                        hide();
                    }
                }
            };
            addEvent(that, 'keyup', that.keyupHandler);

            that.focusHandler = function(e){
                that.last_val = '\n';
                that.keyupHandler(e)
            };
            addEvent(that, 'focus', that.focusHandler);
        }

        // public destroy method
        this.destroy = function(){
            for (var i=0; i<elems.length; i++) {
                var that = elems[i];
                removeEvent(window, 'resize', that.updateSC);
                removeEvent(window.visualViewport, 'resize', that.updateSC);
                removeEvent(window.visualViewport, 'scroll', that.updateSC);
                removeEvent(that, 'blur', that.blurHandler);
                removeEvent(that, 'focus', that.focusHandler);
                removeEvent(that, 'keydown', that.keydownHandler);
                removeEvent(that, 'keyup', that.keyupHandler);
                if (that.autocompleteAttr)
                    that.setAttribute('autocomplete', that.autocompleteAttr);
                else
                    that.removeAttribute('autocomplete');
                try {
                    that.sc.parentNode.removeChild(that.sc);
                } catch (error) {
                    console.log('Destroying error: can\'t find target selector', error);
                    throw error;
                }
                that = null;
            }
        };
    }
    return autoComplete;
})();

(function(){
    if (typeof define === 'function' && define.amd)
        define('autoComplete', function () { return autoComplete; });
    else if (typeof module !== 'undefined' && module.exports)
        module.exports = autoComplete;
    else
        window.autoComplete = autoComplete;
})();

;
window.relearn = window.relearn || {};
window.relearn.search = window.relearn.search || {};
window.relearn.search.config = {"contentLangs":["fr"]};

;
/*

# Adapter Interface

The search adapter needs to provide the following functions that are called from search.js

## init()

Initialize the search engine and the search index; called once, not before a
search is about to happen

### Parameters

none

### Returns

none

### Remarks

Once successfully completed, needs to call

	````
    window.relearn.isSearchEngineReady = true;
    window.relearn.executeInitialSearch();
	````

## search()

Performs the search and returs found results.

### Parameters

term: string // the search term that was typed in by the user

### Returns

Must return an array of found pages, sorted with the most relevant page first.

Each array item needs the following layout:

````
{
    index: string, // optional, id of the page in the search index
    matches: string[], // optional, array of found terms; will be used to show an excerpt of the content positioned at the term
    page: {
        breadcrumb: string,
        title: string,
        uri: string,
        content: string,
        tags: string[]
    }
}
````
*/

(function () {
  let lunrIndex, pagesIndex;

  function init() {
    var contentLangs = window.relearn.search.config.contentLangs;

    function initIndex(index) {
      if (!window.lunr) {
        return;
      }
      pagesIndex = index;
      // Set up Lunr by declaring the fields we use
      // Also provide their boost level for the ranking
      lunrIndex = lunr(function () {
        this.use(lunr.multiLanguage.apply(null, contentLangs));
        this.ref('index');
        this.field('title', {
          boost: 15,
        });
        this.field('tags', {
          boost: 10,
        });
        this.field('content', {
          boost: 5,
        });

        this.pipeline.remove(lunr.stemmer);
        this.searchPipeline.remove(lunr.stemmer);

        // Feed Lunr with each file and let index them
        pagesIndex.forEach(function (page, idx) {
          page.index = idx;
          this.add(page);
        }, this);
      });

      window.relearn.isSearchEngineReady = true;
      window.relearn.executeInitialSearch();
    }

    if (window.relearn.index_js_url) {
      var js = document.createElement('script');
      js.src = window.relearn.index_js_url;
      if (window.relearn.index_js_integrity) {
        js.integrity = window.relearn.index_js_integrity;
      }
      js.setAttribute('async', '');
      js.addEventListener('load', function () {
        initIndex(relearn_searchindex);
      });
      js.addEventListener('error', function (e) {
        console.error('Error getting Hugo index file');
      });
      document.head.appendChild(js);
    }
  }

  function search(term) {
    function searchPatterns(word) {
      // for short words high amounts of typos doesn't make sense
      // for long words we allow less typos because this largely increases search time
      var typos = [
        { len: -1, typos: 1 },
        { len: 60, typos: 2 },
        { len: 40, typos: 3 },
        { len: 20, typos: 4 },
        { len: 16, typos: 3 },
        { len: 12, typos: 2 },
        { len: 8, typos: 1 },
        { len: 4, typos: 0 },
      ];
      var patterns = [word + '^100', word + '*^10', '*' + word + '^10'];
      // typos are only of interest for a word that isn't found as written;
      // otherwise similar words bury the hits that were asked for
      if (!lunrIndex.search(patterns.join(' ')).length) {
        patterns.push(
          word +
            '~' +
            typos.reduce(function (a, c, i) {
              return word.length < c.len ? c : a;
            }).typos +
            '^1'
        );
      }
      return patterns;
    }

    // Find the item in our index corresponding to the Lunr one to have more info
    // Remove Lunr special search characters: https://lunrjs.com/guides/searching.html
    if (!window.lunr || !lunrIndex) {
      return [];
    }
    term = term.replace(/[*:^~+-]/g, ' ');
    var searchTerm = lunr
      .tokenizer(term)
      .reduce(function (a, token) {
        return a.concat(searchPatterns(token.str));
      }, [])
      .join(' ');
    return !searchTerm || !lunrIndex
      ? []
      : lunrIndex.search(searchTerm).map(function (result) {
          return { index: result.ref, matches: [term, ...Object.keys(result.matchData.metadata)], page: pagesIndex[result.ref] };
        });
  }

  window.relearn = window.relearn ?? {};
  window.relearn.search = window.relearn.search ?? {};
  window.relearn.search.adapter = { init, search };
})();

;
/**
 * lunr - http://lunrjs.com - A bit like Solr, but much smaller and not as bright - 2.3.9
 * Copyright (C) 2020 Oliver Nightingale
 * @license MIT
 */
 !function(){var e=function(t){var r=new e.Builder;return r.pipeline.add(e.trimmer,e.stopWordFilter,e.stemmer),r.searchPipeline.add(e.stemmer),t.call(r,r),r.build()};e.version="2.3.9",e.utils={},e.utils.warn=function(e){return function(t){e.console&&console.warn&&console.warn(t)}}(this),e.utils.asString=function(e){return void 0===e||null===e?"":e.toString()},e.utils.clone=function(e){if(null===e||void 0===e)return e;for(var t=Object.create(null),r=Object.keys(e),i=0;i<r.length;i++){var n=r[i],s=e[n];if(Array.isArray(s))t[n]=s.slice();else{if("string"!=typeof s&&"number"!=typeof s&&"boolean"!=typeof s)throw new TypeError("clone is not deep and does not support nested objects");t[n]=s}}return t},e.FieldRef=function(e,t,r){this.docRef=e,this.fieldName=t,this._stringValue=r},e.FieldRef.joiner="/",e.FieldRef.fromString=function(t){var r=t.indexOf(e.FieldRef.joiner);if(r===-1)throw"malformed field ref string";var i=t.slice(0,r),n=t.slice(r+1);return new e.FieldRef(n,i,t)},e.FieldRef.prototype.toString=function(){return void 0==this._stringValue&&(this._stringValue=this.fieldName+e.FieldRef.joiner+this.docRef),this._stringValue},e.Set=function(e){if(this.elements=Object.create(null),e){this.length=e.length;for(var t=0;t<this.length;t++)this.elements[e[t]]=!0}else this.length=0},e.Set.complete={intersect:function(e){return e},union:function(){return this},contains:function(){return!0}},e.Set.empty={intersect:function(){return this},union:function(e){return e},contains:function(){return!1}},e.Set.prototype.contains=function(e){return!!this.elements[e]},e.Set.prototype.intersect=function(t){var r,i,n,s=[];if(t===e.Set.complete)return this;if(t===e.Set.empty)return t;this.length<t.length?(r=this,i=t):(r=t,i=this),n=Object.keys(r.elements);for(var o=0;o<n.length;o++){var a=n[o];a in i.elements&&s.push(a)}return new e.Set(s)},e.Set.prototype.union=function(t){return t===e.Set.complete?e.Set.complete:t===e.Set.empty?this:new e.Set(Object.keys(this.elements).concat(Object.keys(t.elements)))},e.idf=function(e,t){var r=0;for(var i in e)"_index"!=i&&(r+=Object.keys(e[i]).length);var n=(t-r+.5)/(r+.5);return Math.log(1+Math.abs(n))},e.Token=function(e,t){this.str=e||"",this.metadata=t||{}},e.Token.prototype.toString=function(){return this.str},e.Token.prototype.update=function(e){return this.str=e(this.str,this.metadata),this},e.Token.prototype.clone=function(t){return t=t||function(e){return e},new e.Token(t(this.str,this.metadata),this.metadata)},e.tokenizer=function(t,r){if(null==t||void 0==t)return[];if(Array.isArray(t))return t.map(function(t){return new e.Token(e.utils.asString(t).toLowerCase(),e.utils.clone(r))});for(var i=t.toString().toLowerCase(),n=i.length,s=[],o=0,a=0;o<=n;o++){var u=i.charAt(o),l=o-a;if(u.match(e.tokenizer.separator)||o==n){if(l>0){var c=e.utils.clone(r)||{};c.position=[a,l],c.index=s.length,s.push(new e.Token(i.slice(a,o),c))}a=o+1}}return s},e.tokenizer.separator=/[\s\-]+/,e.Pipeline=function(){this._stack=[]},e.Pipeline.registeredFunctions=Object.create(null),e.Pipeline.registerFunction=function(t,r){r in this.registeredFunctions&&e.utils.warn("Overwriting existing registered function: "+r),t.label=r,e.Pipeline.registeredFunctions[t.label]=t},e.Pipeline.warnIfFunctionNotRegistered=function(t){var r=t.label&&t.label in this.registeredFunctions;r||e.utils.warn("Function is not registered with pipeline. This may cause problems when serialising the index.\n",t)},e.Pipeline.load=function(t){var r=new e.Pipeline;return t.forEach(function(t){var i=e.Pipeline.registeredFunctions[t];if(!i)throw new Error("Cannot load unregistered function: "+t);r.add(i)}),r},e.Pipeline.prototype.add=function(){var t=Array.prototype.slice.call(arguments);t.forEach(function(t){e.Pipeline.warnIfFunctionNotRegistered(t),this._stack.push(t)},this)},e.Pipeline.prototype.after=function(t,r){e.Pipeline.warnIfFunctionNotRegistered(r);var i=this._stack.indexOf(t);if(i==-1)throw new Error("Cannot find existingFn");i+=1,this._stack.splice(i,0,r)},e.Pipeline.prototype.before=function(t,r){e.Pipeline.warnIfFunctionNotRegistered(r);var i=this._stack.indexOf(t);if(i==-1)throw new Error("Cannot find existingFn");this._stack.splice(i,0,r)},e.Pipeline.prototype.remove=function(e){var t=this._stack.indexOf(e);t!=-1&&this._stack.splice(t,1)},e.Pipeline.prototype.run=function(e){for(var t=this._stack.length,r=0;r<t;r++){for(var i=this._stack[r],n=[],s=0;s<e.length;s++){var o=i(e[s],s,e);if(null!==o&&void 0!==o&&""!==o)if(Array.isArray(o))for(var a=0;a<o.length;a++)n.push(o[a]);else n.push(o)}e=n}return e},e.Pipeline.prototype.runString=function(t,r){var i=new e.Token(t,r);return this.run([i]).map(function(e){return e.toString()})},e.Pipeline.prototype.reset=function(){this._stack=[]},e.Pipeline.prototype.toJSON=function(){return this._stack.map(function(t){return e.Pipeline.warnIfFunctionNotRegistered(t),t.label})},e.Vector=function(e){this._magnitude=0,this.elements=e||[]},e.Vector.prototype.positionForIndex=function(e){if(0==this.elements.length)return 0;for(var t=0,r=this.elements.length/2,i=r-t,n=Math.floor(i/2),s=this.elements[2*n];i>1&&(s<e&&(t=n),s>e&&(r=n),s!=e);)i=r-t,n=t+Math.floor(i/2),s=this.elements[2*n];return s==e?2*n:s>e?2*n:s<e?2*(n+1):void 0},e.Vector.prototype.insert=function(e,t){this.upsert(e,t,function(){throw"duplicate index"})},e.Vector.prototype.upsert=function(e,t,r){this._magnitude=0;var i=this.positionForIndex(e);this.elements[i]==e?this.elements[i+1]=r(this.elements[i+1],t):this.elements.splice(i,0,e,t)},e.Vector.prototype.magnitude=function(){if(this._magnitude)return this._magnitude;for(var e=0,t=this.elements.length,r=1;r<t;r+=2){var i=this.elements[r];e+=i*i}return this._magnitude=Math.sqrt(e)},e.Vector.prototype.dot=function(e){for(var t=0,r=this.elements,i=e.elements,n=r.length,s=i.length,o=0,a=0,u=0,l=0;u<n&&l<s;)o=r[u],a=i[l],o<a?u+=2:o>a?l+=2:o==a&&(t+=r[u+1]*i[l+1],u+=2,l+=2);return t},e.Vector.prototype.similarity=function(e){return this.dot(e)/this.magnitude()||0},e.Vector.prototype.toArray=function(){for(var e=new Array(this.elements.length/2),t=1,r=0;t<this.elements.length;t+=2,r++)e[r]=this.elements[t];return e},e.Vector.prototype.toJSON=function(){return this.elements},e.stemmer=function(){var e={ational:"ate",tional:"tion",enci:"ence",anci:"ance",izer:"ize",bli:"ble",alli:"al",entli:"ent",eli:"e",ousli:"ous",ization:"ize",ation:"ate",ator:"ate",alism:"al",iveness:"ive",fulness:"ful",ousness:"ous",aliti:"al",iviti:"ive",biliti:"ble",logi:"log"},t={icate:"ic",ative:"",alize:"al",iciti:"ic",ical:"ic",ful:"",ness:""},r="[^aeiou]",i="[aeiouy]",n=r+"[^aeiouy]*",s=i+"[aeiou]*",o="^("+n+")?"+s+n,a="^("+n+")?"+s+n+"("+s+")?$",u="^("+n+")?"+s+n+s+n,l="^("+n+")?"+i,c=new RegExp(o),h=new RegExp(u),d=new RegExp(a),f=new RegExp(l),p=/^(.+?)(ss|i)es$/,y=/^(.+?)([^s])s$/,m=/^(.+?)eed$/,v=/^(.+?)(ed|ing)$/,g=/.$/,x=/(at|bl|iz)$/,w=new RegExp("([^aeiouylsz])\\1$"),Q=new RegExp("^"+n+i+"[^aeiouwxy]$"),k=/^(.+?[^aeiou])y$/,S=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,E=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,L=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,b=/^(.+?)(s|t)(ion)$/,P=/^(.+?)e$/,T=/ll$/,O=new RegExp("^"+n+i+"[^aeiouwxy]$"),I=function(r){var i,n,s,o,a,u,l;if(r.length<3)return r;if(s=r.substr(0,1),"y"==s&&(r=s.toUpperCase()+r.substr(1)),o=p,a=y,o.test(r)?r=r.replace(o,"$1$2"):a.test(r)&&(r=r.replace(a,"$1$2")),o=m,a=v,o.test(r)){var I=o.exec(r);o=c,o.test(I[1])&&(o=g,r=r.replace(o,""))}else if(a.test(r)){var I=a.exec(r);i=I[1],a=f,a.test(i)&&(r=i,a=x,u=w,l=Q,a.test(r)?r+="e":u.test(r)?(o=g,r=r.replace(o,"")):l.test(r)&&(r+="e"))}if(o=k,o.test(r)){var I=o.exec(r);i=I[1],r=i+"i"}if(o=S,o.test(r)){var I=o.exec(r);i=I[1],n=I[2],o=c,o.test(i)&&(r=i+e[n])}if(o=E,o.test(r)){var I=o.exec(r);i=I[1],n=I[2],o=c,o.test(i)&&(r=i+t[n])}if(o=L,a=b,o.test(r)){var I=o.exec(r);i=I[1],o=h,o.test(i)&&(r=i)}else if(a.test(r)){var I=a.exec(r);i=I[1]+I[2],a=h,a.test(i)&&(r=i)}if(o=P,o.test(r)){var I=o.exec(r);i=I[1],o=h,a=d,u=O,(o.test(i)||a.test(i)&&!u.test(i))&&(r=i)}return o=T,a=h,o.test(r)&&a.test(r)&&(o=g,r=r.replace(o,"")),"y"==s&&(r=s.toLowerCase()+r.substr(1)),r};return function(e){return e.update(I)}}(),e.Pipeline.registerFunction(e.stemmer,"stemmer"),e.generateStopWordFilter=function(e){var t=e.reduce(function(e,t){return e[t]=t,e},{});return function(e){if(e&&t[e.toString()]!==e.toString())return e}},e.stopWordFilter=e.generateStopWordFilter(["a","able","about","across","after","all","almost","also","am","among","an","and","any","are","as","at","be","because","been","but","by","can","cannot","could","dear","did","do","does","either","else","ever","every","for","from","get","got","had","has","have","he","her","hers","him","his","how","however","i","if","in","into","is","it","its","just","least","let","like","likely","may","me","might","most","must","my","neither","no","nor","not","of","off","often","on","only","or","other","our","own","rather","said","say","says","she","should","since","so","some","than","that","the","their","them","then","there","these","they","this","tis","to","too","twas","us","wants","was","we","were","what","when","where","which","while","who","whom","why","will","with","would","yet","you","your"]),e.Pipeline.registerFunction(e.stopWordFilter,"stopWordFilter"),e.trimmer=function(e){return e.update(function(e){return e.replace(/^\W+/,"").replace(/\W+$/,"")})},e.Pipeline.registerFunction(e.trimmer,"trimmer"),e.TokenSet=function(){this["final"]=!1,this.edges={},this.id=e.TokenSet._nextId,e.TokenSet._nextId+=1},e.TokenSet._nextId=1,e.TokenSet.fromArray=function(t){for(var r=new e.TokenSet.Builder,i=0,n=t.length;i<n;i++)r.insert(t[i]);return r.finish(),r.root},e.TokenSet.fromClause=function(t){return"editDistance"in t?e.TokenSet.fromFuzzyString(t.term,t.editDistance):e.TokenSet.fromString(t.term)},e.TokenSet.fromFuzzyString=function(t,r){for(var i=new e.TokenSet,n=[{node:i,editsRemaining:r,str:t}];n.length;){var s=n.pop();if(s.str.length>0){var o,a=s.str.charAt(0);a in s.node.edges?o=s.node.edges[a]:(o=new e.TokenSet,s.node.edges[a]=o),1==s.str.length&&(o["final"]=!0),n.push({node:o,editsRemaining:s.editsRemaining,str:s.str.slice(1)})}if(0!=s.editsRemaining){if("*"in s.node.edges)var u=s.node.edges["*"];else{var u=new e.TokenSet;s.node.edges["*"]=u}if(0==s.str.length&&(u["final"]=!0),n.push({node:u,editsRemaining:s.editsRemaining-1,str:s.str}),s.str.length>1&&n.push({node:s.node,editsRemaining:s.editsRemaining-1,str:s.str.slice(1)}),1==s.str.length&&(s.node["final"]=!0),s.str.length>=1){if("*"in s.node.edges)var l=s.node.edges["*"];else{var l=new e.TokenSet;s.node.edges["*"]=l}1==s.str.length&&(l["final"]=!0),n.push({node:l,editsRemaining:s.editsRemaining-1,str:s.str.slice(1)})}if(s.str.length>1){var c,h=s.str.charAt(0),d=s.str.charAt(1);d in s.node.edges?c=s.node.edges[d]:(c=new e.TokenSet,s.node.edges[d]=c),1==s.str.length&&(c["final"]=!0),n.push({node:c,editsRemaining:s.editsRemaining-1,str:h+s.str.slice(2)})}}}return i},e.TokenSet.fromString=function(t){for(var r=new e.TokenSet,i=r,n=0,s=t.length;n<s;n++){var o=t[n],a=n==s-1;if("*"==o)r.edges[o]=r,r["final"]=a;else{var u=new e.TokenSet;u["final"]=a,r.edges[o]=u,r=u}}return i},e.TokenSet.prototype.toArray=function(){for(var e=[],t=[{prefix:"",node:this}];t.length;){var r=t.pop(),i=Object.keys(r.node.edges),n=i.length;r.node["final"]&&(r.prefix.charAt(0),e.push(r.prefix));for(var s=0;s<n;s++){var o=i[s];t.push({prefix:r.prefix.concat(o),node:r.node.edges[o]})}}return e},e.TokenSet.prototype.toString=function(){if(this._str)return this._str;for(var e=this["final"]?"1":"0",t=Object.keys(this.edges).sort(),r=t.length,i=0;i<r;i++){var n=t[i],s=this.edges[n];e=e+n+s.id}return e},e.TokenSet.prototype.intersect=function(t){for(var r=new e.TokenSet,i=void 0,n=[{qNode:t,output:r,node:this}];n.length;){i=n.pop();for(var s=Object.keys(i.qNode.edges),o=s.length,a=Object.keys(i.node.edges),u=a.length,l=0;l<o;l++)for(var c=s[l],h=0;h<u;h++){var d=a[h];if(d==c||"*"==c){var f=i.node.edges[d],p=i.qNode.edges[c],y=f["final"]&&p["final"],m=void 0;d in i.output.edges?(m=i.output.edges[d],m["final"]=m["final"]||y):(m=new e.TokenSet,m["final"]=y,i.output.edges[d]=m),n.push({qNode:p,output:m,node:f})}}}return r},e.TokenSet.Builder=function(){this.previousWord="",this.root=new e.TokenSet,this.uncheckedNodes=[],this.minimizedNodes={}},e.TokenSet.Builder.prototype.insert=function(t){var r,i=0;if(t<this.previousWord)throw new Error("Out of order word insertion");for(var n=0;n<t.length&&n<this.previousWord.length&&t[n]==this.previousWord[n];n++)i++;this.minimize(i),r=0==this.uncheckedNodes.length?this.root:this.uncheckedNodes[this.uncheckedNodes.length-1].child;for(var n=i;n<t.length;n++){var s=new e.TokenSet,o=t[n];r.edges[o]=s,this.uncheckedNodes.push({parent:r,"char":o,child:s}),r=s}r["final"]=!0,this.previousWord=t},e.TokenSet.Builder.prototype.finish=function(){this.minimize(0)},e.TokenSet.Builder.prototype.minimize=function(e){for(var t=this.uncheckedNodes.length-1;t>=e;t--){var r=this.uncheckedNodes[t],i=r.child.toString();i in this.minimizedNodes?r.parent.edges[r["char"]]=this.minimizedNodes[i]:(r.child._str=i,this.minimizedNodes[i]=r.child),this.uncheckedNodes.pop()}},e.Index=function(e){this.invertedIndex=e.invertedIndex,this.fieldVectors=e.fieldVectors,this.tokenSet=e.tokenSet,this.fields=e.fields,this.pipeline=e.pipeline},e.Index.prototype.search=function(t){return this.query(function(r){var i=new e.QueryParser(t,r);i.parse()})},e.Index.prototype.query=function(t){for(var r=new e.Query(this.fields),i=Object.create(null),n=Object.create(null),s=Object.create(null),o=Object.create(null),a=Object.create(null),u=0;u<this.fields.length;u++)n[this.fields[u]]=new e.Vector;t.call(r,r);for(var u=0;u<r.clauses.length;u++){var l=r.clauses[u],c=null,h=e.Set.empty;c=l.usePipeline?this.pipeline.runString(l.term,{fields:l.fields}):[l.term];for(var d=0;d<c.length;d++){var f=c[d];l.term=f;var p=e.TokenSet.fromClause(l),y=this.tokenSet.intersect(p).toArray();if(0===y.length&&l.presence===e.Query.presence.REQUIRED){for(var m=0;m<l.fields.length;m++){var v=l.fields[m];o[v]=e.Set.empty}break}for(var g=0;g<y.length;g++)for(var x=y[g],w=this.invertedIndex[x],Q=w._index,m=0;m<l.fields.length;m++){var v=l.fields[m],k=w[v],S=Object.keys(k),E=x+"/"+v,L=new e.Set(S);if(l.presence==e.Query.presence.REQUIRED&&(h=h.union(L),void 0===o[v]&&(o[v]=e.Set.complete)),l.presence!=e.Query.presence.PROHIBITED){if(n[v].upsert(Q,l.boost,function(e,t){return e+t}),!s[E]){for(var b=0;b<S.length;b++){var P,T=S[b],O=new e.FieldRef(T,v),I=k[T];void 0===(P=i[O])?i[O]=new e.MatchData(x,v,I):P.add(x,v,I)}s[E]=!0}}else void 0===a[v]&&(a[v]=e.Set.empty),a[v]=a[v].union(L)}}if(l.presence===e.Query.presence.REQUIRED)for(var m=0;m<l.fields.length;m++){var v=l.fields[m];o[v]=o[v].intersect(h)}}for(var R=e.Set.complete,F=e.Set.empty,u=0;u<this.fields.length;u++){var v=this.fields[u];o[v]&&(R=R.intersect(o[v])),a[v]&&(F=F.union(a[v]))}var C=Object.keys(i),N=[],_=Object.create(null);if(r.isNegated()){C=Object.keys(this.fieldVectors);for(var u=0;u<C.length;u++){var O=C[u],j=e.FieldRef.fromString(O);i[O]=new e.MatchData}}for(var u=0;u<C.length;u++){var j=e.FieldRef.fromString(C[u]),D=j.docRef;if(R.contains(D)&&!F.contains(D)){var A,B=this.fieldVectors[j],V=n[j.fieldName].similarity(B);if(void 0!==(A=_[D]))A.score+=V,A.matchData.combine(i[j]);else{var z={ref:D,score:V,matchData:i[j]};_[D]=z,N.push(z)}}}return N.sort(function(e,t){return t.score-e.score})},e.Index.prototype.toJSON=function(){var t=Object.keys(this.invertedIndex).sort().map(function(e){return[e,this.invertedIndex[e]]},this),r=Object.keys(this.fieldVectors).map(function(e){return[e,this.fieldVectors[e].toJSON()]},this);return{version:e.version,fields:this.fields,fieldVectors:r,invertedIndex:t,pipeline:this.pipeline.toJSON()}},e.Index.load=function(t){var r={},i={},n=t.fieldVectors,s=Object.create(null),o=t.invertedIndex,a=new e.TokenSet.Builder,u=e.Pipeline.load(t.pipeline);t.version!=e.version&&e.utils.warn("Version mismatch when loading serialised index. Current version of lunr '"+e.version+"' does not match serialized index '"+t.version+"'");for(var l=0;l<n.length;l++){var c=n[l],h=c[0],d=c[1];i[h]=new e.Vector(d)}for(var l=0;l<o.length;l++){var c=o[l],f=c[0],p=c[1];a.insert(f),s[f]=p}return a.finish(),r.fields=t.fields,r.fieldVectors=i,r.invertedIndex=s,r.tokenSet=a.root,r.pipeline=u,new e.Index(r)},e.Builder=function(){this._ref="id",this._fields=Object.create(null),this._documents=Object.create(null),this.invertedIndex=Object.create(null),this.fieldTermFrequencies={},this.fieldLengths={},this.tokenizer=e.tokenizer,this.pipeline=new e.Pipeline,this.searchPipeline=new e.Pipeline,this.documentCount=0,this._b=.75,this._k1=1.2,this.termIndex=0,this.metadataWhitelist=[]},e.Builder.prototype.ref=function(e){this._ref=e},e.Builder.prototype.field=function(e,t){if(/\//.test(e))throw new RangeError("Field '"+e+"' contains illegal character '/'");this._fields[e]=t||{}},e.Builder.prototype.b=function(e){e<0?this._b=0:e>1?this._b=1:this._b=e},e.Builder.prototype.k1=function(e){this._k1=e},e.Builder.prototype.add=function(t,r){var i=t[this._ref],n=Object.keys(this._fields);this._documents[i]=r||{},this.documentCount+=1;for(var s=0;s<n.length;s++){var o=n[s],a=this._fields[o].extractor,u=a?a(t):t[o],l=this.tokenizer(u,{fields:[o]}),c=this.pipeline.run(l),h=new e.FieldRef(i,o),d=Object.create(null);this.fieldTermFrequencies[h]=d,this.fieldLengths[h]=0,this.fieldLengths[h]+=c.length;for(var f=0;f<c.length;f++){var p=c[f];if(void 0==d[p]&&(d[p]=0),d[p]+=1,void 0==this.invertedIndex[p]){var y=Object.create(null);y._index=this.termIndex,this.termIndex+=1;for(var m=0;m<n.length;m++)y[n[m]]=Object.create(null);this.invertedIndex[p]=y}void 0==this.invertedIndex[p][o][i]&&(this.invertedIndex[p][o][i]=Object.create(null));for(var v=0;v<this.metadataWhitelist.length;v++){var g=this.metadataWhitelist[v],x=p.metadata[g];void 0==this.invertedIndex[p][o][i][g]&&(this.invertedIndex[p][o][i][g]=[]),this.invertedIndex[p][o][i][g].push(x)}}}},e.Builder.prototype.calculateAverageFieldLengths=function(){for(var t=Object.keys(this.fieldLengths),r=t.length,i={},n={},s=0;s<r;s++){var o=e.FieldRef.fromString(t[s]),a=o.fieldName;n[a]||(n[a]=0),n[a]+=1,i[a]||(i[a]=0),i[a]+=this.fieldLengths[o]}for(var u=Object.keys(this._fields),s=0;s<u.length;s++){var l=u[s];i[l]=i[l]/n[l]}this.averageFieldLength=i},e.Builder.prototype.createFieldVectors=function(){for(var t={},r=Object.keys(this.fieldTermFrequencies),i=r.length,n=Object.create(null),s=0;s<i;s++){for(var o=e.FieldRef.fromString(r[s]),a=o.fieldName,u=this.fieldLengths[o],l=new e.Vector,c=this.fieldTermFrequencies[o],h=Object.keys(c),d=h.length,f=this._fields[a].boost||1,p=this._documents[o.docRef].boost||1,y=0;y<d;y++){var m,v,g,x=h[y],w=c[x],Q=this.invertedIndex[x]._index;void 0===n[x]?(m=e.idf(this.invertedIndex[x],this.documentCount),n[x]=m):m=n[x],v=m*((this._k1+1)*w)/(this._k1*(1-this._b+this._b*(u/this.averageFieldLength[a]))+w),v*=f,v*=p,g=Math.round(1e3*v)/1e3,l.insert(Q,g)}t[o]=l}this.fieldVectors=t},e.Builder.prototype.createTokenSet=function(){this.tokenSet=e.TokenSet.fromArray(Object.keys(this.invertedIndex).sort())},e.Builder.prototype.build=function(){return this.calculateAverageFieldLengths(),this.createFieldVectors(),this.createTokenSet(),new e.Index({invertedIndex:this.invertedIndex,fieldVectors:this.fieldVectors,tokenSet:this.tokenSet,fields:Object.keys(this._fields),pipeline:this.searchPipeline})},e.Builder.prototype.use=function(e){var t=Array.prototype.slice.call(arguments,1);t.unshift(this),e.apply(this,t)},e.MatchData=function(e,t,r){for(var i=Object.create(null),n=Object.keys(r||{}),s=0;s<n.length;s++){var o=n[s];i[o]=r[o].slice()}this.metadata=Object.create(null),void 0!==e&&(this.metadata[e]=Object.create(null),this.metadata[e][t]=i)},e.MatchData.prototype.combine=function(e){for(var t=Object.keys(e.metadata),r=0;r<t.length;r++){var i=t[r],n=Object.keys(e.metadata[i]);void 0==this.metadata[i]&&(this.metadata[i]=Object.create(null));for(var s=0;s<n.length;s++){var o=n[s],a=Object.keys(e.metadata[i][o]);void 0==this.metadata[i][o]&&(this.metadata[i][o]=Object.create(null));for(var u=0;u<a.length;u++){var l=a[u];void 0==this.metadata[i][o][l]?this.metadata[i][o][l]=e.metadata[i][o][l]:this.metadata[i][o][l]=this.metadata[i][o][l].concat(e.metadata[i][o][l])}}}},e.MatchData.prototype.add=function(e,t,r){if(!(e in this.metadata))return this.metadata[e]=Object.create(null),void(this.metadata[e][t]=r);if(!(t in this.metadata[e]))return void(this.metadata[e][t]=r);for(var i=Object.keys(r),n=0;n<i.length;n++){var s=i[n];s in this.metadata[e][t]?this.metadata[e][t][s]=this.metadata[e][t][s].concat(r[s]):this.metadata[e][t][s]=r[s]}},e.Query=function(e){this.clauses=[],this.allFields=e},e.Query.wildcard=new String("*"),e.Query.wildcard.NONE=0,e.Query.wildcard.LEADING=1,e.Query.wildcard.TRAILING=2,e.Query.presence={OPTIONAL:1,REQUIRED:2,PROHIBITED:3},e.Query.prototype.clause=function(t){return"fields"in t||(t.fields=this.allFields),"boost"in t||(t.boost=1),"usePipeline"in t||(t.usePipeline=!0),"wildcard"in t||(t.wildcard=e.Query.wildcard.NONE),t.wildcard&e.Query.wildcard.LEADING&&t.term.charAt(0)!=e.Query.wildcard&&(t.term="*"+t.term),t.wildcard&e.Query.wildcard.TRAILING&&t.term.slice(-1)!=e.Query.wildcard&&(t.term=""+t.term+"*"),"presence"in t||(t.presence=e.Query.presence.OPTIONAL),this.clauses.push(t),this},e.Query.prototype.isNegated=function(){for(var t=0;t<this.clauses.length;t++)if(this.clauses[t].presence!=e.Query.presence.PROHIBITED)return!1;return!0},e.Query.prototype.term=function(t,r){if(Array.isArray(t))return t.forEach(function(t){this.term(t,e.utils.clone(r))},this),this;var i=r||{};return i.term=t.toString(),this.clause(i),this},e.QueryParseError=function(e,t,r){this.name="QueryParseError",this.message=e,this.start=t,this.end=r},e.QueryParseError.prototype=new Error,e.QueryLexer=function(e){this.lexemes=[],this.str=e,this.length=e.length,this.pos=0,this.start=0,this.escapeCharPositions=[]},e.QueryLexer.prototype.run=function(){for(var t=e.QueryLexer.lexText;t;)t=t(this)},e.QueryLexer.prototype.sliceString=function(){for(var e=[],t=this.start,r=this.pos,i=0;i<this.escapeCharPositions.length;i++)r=this.escapeCharPositions[i],e.push(this.str.slice(t,r)),t=r+1;return e.push(this.str.slice(t,this.pos)),this.escapeCharPositions.length=0,e.join("")},e.QueryLexer.prototype.emit=function(e){this.lexemes.push({type:e,str:this.sliceString(),start:this.start,end:this.pos}),this.start=this.pos},e.QueryLexer.prototype.escapeCharacter=function(){this.escapeCharPositions.push(this.pos-1),this.pos+=1},e.QueryLexer.prototype.next=function(){if(this.pos>=this.length)return e.QueryLexer.EOS;var t=this.str.charAt(this.pos);return this.pos+=1,t},e.QueryLexer.prototype.width=function(){return this.pos-this.start},e.QueryLexer.prototype.ignore=function(){this.start==this.pos&&(this.pos+=1),this.start=this.pos},e.QueryLexer.prototype.backup=function(){this.pos-=1},e.QueryLexer.prototype.acceptDigitRun=function(){var t,r;do t=this.next(),r=t.charCodeAt(0);while(r>47&&r<58);t!=e.QueryLexer.EOS&&this.backup()},e.QueryLexer.prototype.more=function(){return this.pos<this.length},e.QueryLexer.EOS="EOS",e.QueryLexer.FIELD="FIELD",e.QueryLexer.TERM="TERM",e.QueryLexer.EDIT_DISTANCE="EDIT_DISTANCE",e.QueryLexer.BOOST="BOOST",e.QueryLexer.PRESENCE="PRESENCE",e.QueryLexer.lexField=function(t){return t.backup(),t.emit(e.QueryLexer.FIELD),t.ignore(),e.QueryLexer.lexText},e.QueryLexer.lexTerm=function(t){if(t.width()>1&&(t.backup(),t.emit(e.QueryLexer.TERM)),t.ignore(),t.more())return e.QueryLexer.lexText},e.QueryLexer.lexEditDistance=function(t){return t.ignore(),t.acceptDigitRun(),t.emit(e.QueryLexer.EDIT_DISTANCE),e.QueryLexer.lexText},e.QueryLexer.lexBoost=function(t){return t.ignore(),t.acceptDigitRun(),t.emit(e.QueryLexer.BOOST),e.QueryLexer.lexText},e.QueryLexer.lexEOS=function(t){t.width()>0&&t.emit(e.QueryLexer.TERM)},e.QueryLexer.termSeparator=e.tokenizer.separator,e.QueryLexer.lexText=function(t){for(;;){var r=t.next();if(r==e.QueryLexer.EOS)return e.QueryLexer.lexEOS;if(92!=r.charCodeAt(0)){if(":"==r)return e.QueryLexer.lexField;if("~"==r)return t.backup(),t.width()>0&&t.emit(e.QueryLexer.TERM),e.QueryLexer.lexEditDistance;if("^"==r)return t.backup(),t.width()>0&&t.emit(e.QueryLexer.TERM),e.QueryLexer.lexBoost;if("+"==r&&1===t.width())return t.emit(e.QueryLexer.PRESENCE),e.QueryLexer.lexText;if("-"==r&&1===t.width())return t.emit(e.QueryLexer.PRESENCE),e.QueryLexer.lexText;if(r.match(e.QueryLexer.termSeparator))return e.QueryLexer.lexTerm}else t.escapeCharacter()}},e.QueryParser=function(t,r){this.lexer=new e.QueryLexer(t),this.query=r,this.currentClause={},this.lexemeIdx=0},e.QueryParser.prototype.parse=function(){this.lexer.run(),this.lexemes=this.lexer.lexemes;for(var t=e.QueryParser.parseClause;t;)t=t(this);return this.query},e.QueryParser.prototype.peekLexeme=function(){return this.lexemes[this.lexemeIdx]},e.QueryParser.prototype.consumeLexeme=function(){var e=this.peekLexeme();return this.lexemeIdx+=1,e},e.QueryParser.prototype.nextClause=function(){var e=this.currentClause;this.query.clause(e),this.currentClause={}},e.QueryParser.parseClause=function(t){var r=t.peekLexeme();if(void 0!=r)switch(r.type){case e.QueryLexer.PRESENCE:return e.QueryParser.parsePresence;case e.QueryLexer.FIELD:return e.QueryParser.parseField;case e.QueryLexer.TERM:return e.QueryParser.parseTerm;default:var i="expected either a field or a term, found "+r.type;throw r.str.length>=1&&(i+=" with value '"+r.str+"'"),new e.QueryParseError(i,r.start,r.end)}},e.QueryParser.parsePresence=function(t){var r=t.consumeLexeme();if(void 0!=r){switch(r.str){case"-":t.currentClause.presence=e.Query.presence.PROHIBITED;break;case"+":t.currentClause.presence=e.Query.presence.REQUIRED;break;default:var i="unrecognised presence operator'"+r.str+"'";throw new e.QueryParseError(i,r.start,r.end)}var n=t.peekLexeme();if(void 0==n){var i="expecting term or field, found nothing";throw new e.QueryParseError(i,r.start,r.end)}switch(n.type){case e.QueryLexer.FIELD:return e.QueryParser.parseField;case e.QueryLexer.TERM:return e.QueryParser.parseTerm;default:var i="expecting term or field, found '"+n.type+"'";throw new e.QueryParseError(i,n.start,n.end)}}},e.QueryParser.parseField=function(t){var r=t.consumeLexeme();if(void 0!=r){if(t.query.allFields.indexOf(r.str)==-1){var i=t.query.allFields.map(function(e){return"'"+e+"'"}).join(", "),n="unrecognised field '"+r.str+"', possible fields: "+i;throw new e.QueryParseError(n,r.start,r.end)}t.currentClause.fields=[r.str];var s=t.peekLexeme();if(void 0==s){var n="expecting term, found nothing";throw new e.QueryParseError(n,r.start,r.end)}switch(s.type){case e.QueryLexer.TERM:return e.QueryParser.parseTerm;default:var n="expecting term, found '"+s.type+"'";throw new e.QueryParseError(n,s.start,s.end)}}},e.QueryParser.parseTerm=function(t){var r=t.consumeLexeme();if(void 0!=r){t.currentClause.term=r.str.toLowerCase(),r.str.indexOf("*")!=-1&&(t.currentClause.usePipeline=!1);var i=t.peekLexeme();if(void 0==i)return void t.nextClause();switch(i.type){case e.QueryLexer.TERM:return t.nextClause(),e.QueryParser.parseTerm;case e.QueryLexer.FIELD:return t.nextClause(),e.QueryParser.parseField;case e.QueryLexer.EDIT_DISTANCE:return e.QueryParser.parseEditDistance;case e.QueryLexer.BOOST:return e.QueryParser.parseBoost;case e.QueryLexer.PRESENCE:return t.nextClause(),e.QueryParser.parsePresence;default:var n="Unexpected lexeme type '"+i.type+"'";throw new e.QueryParseError(n,i.start,i.end)}}},e.QueryParser.parseEditDistance=function(t){var r=t.consumeLexeme();if(void 0!=r){var i=parseInt(r.str,10);if(isNaN(i)){var n="edit distance must be numeric";throw new e.QueryParseError(n,r.start,r.end)}t.currentClause.editDistance=i;var s=t.peekLexeme();if(void 0==s)return void t.nextClause();switch(s.type){case e.QueryLexer.TERM:return t.nextClause(),e.QueryParser.parseTerm;case e.QueryLexer.FIELD:return t.nextClause(),e.QueryParser.parseField;case e.QueryLexer.EDIT_DISTANCE:return e.QueryParser.parseEditDistance;case e.QueryLexer.BOOST:return e.QueryParser.parseBoost;case e.QueryLexer.PRESENCE:return t.nextClause(),e.QueryParser.parsePresence;default:var n="Unexpected lexeme type '"+s.type+"'";throw new e.QueryParseError(n,s.start,s.end)}}},e.QueryParser.parseBoost=function(t){var r=t.consumeLexeme();if(void 0!=r){var i=parseInt(r.str,10);if(isNaN(i)){var n="boost must be numeric";throw new e.QueryParseError(n,r.start,r.end)}t.currentClause.boost=i;var s=t.peekLexeme();if(void 0==s)return void t.nextClause();switch(s.type){case e.QueryLexer.TERM:return t.nextClause(),e.QueryParser.parseTerm;case e.QueryLexer.FIELD:return t.nextClause(),e.QueryParser.parseField;case e.QueryLexer.EDIT_DISTANCE:return e.QueryParser.parseEditDistance;case e.QueryLexer.BOOST:return e.QueryParser.parseBoost;case e.QueryLexer.PRESENCE:return t.nextClause(),e.QueryParser.parsePresence;default:var n="Unexpected lexeme type '"+s.type+"'";throw new e.QueryParseError(n,s.start,s.end)}}},function(e,t){"function"==typeof define&&define.amd?define(t):"object"==typeof exports?module.exports=t():e.lunr=t()}(this,function(){return e})}();

;
!function(r,i){"function"==typeof define&&define.amd?define(i):"object"==typeof exports?module.exports=i():i()(r.lunr)}(this,function(){return function(r){r.stemmerSupport={Among:function(r,i,t,e){if(this.toCharArray=function(r){for(var i=r.length,t=new Array(i),e=0;e<i;e++)t[e]=r.charCodeAt(e);return t},!r&&""!=r||!i&&0!=i||!t)throw"Bad Among initialisation: s:"+r+", substring_i: "+i+", result: "+t;this.s_size=r.length,this.s=this.toCharArray(r),this.substring_i=i,this.result=t,this.method=e},SnowballProgram:function(){var r;return{bra:0,ket:0,limit:0,cursor:0,limit_backward:0,setCurrent:function(i){r=i,this.cursor=0,this.limit=i.length,this.limit_backward=0,this.bra=this.cursor,this.ket=this.limit},getCurrent:function(){var i=r;return r=null,i},in_grouping:function(i,t,e){if(this.cursor<this.limit){var s=r.charCodeAt(this.cursor);if(s<=e&&s>=t&&(s-=t,i[s>>3]&1<<(7&s)))return this.cursor++,!0}return!1},in_grouping_b:function(i,t,e){if(this.cursor>this.limit_backward){var s=r.charCodeAt(this.cursor-1);if(s<=e&&s>=t&&(s-=t,i[s>>3]&1<<(7&s)))return this.cursor--,!0}return!1},out_grouping:function(i,t,e){if(this.cursor<this.limit){var s=r.charCodeAt(this.cursor);if(s>e||s<t)return this.cursor++,!0;if(s-=t,!(i[s>>3]&1<<(7&s)))return this.cursor++,!0}return!1},out_grouping_b:function(i,t,e){if(this.cursor>this.limit_backward){var s=r.charCodeAt(this.cursor-1);if(s>e||s<t)return this.cursor--,!0;if(s-=t,!(i[s>>3]&1<<(7&s)))return this.cursor--,!0}return!1},eq_s:function(i,t){if(this.limit-this.cursor<i)return!1;for(var e=0;e<i;e++)if(r.charCodeAt(this.cursor+e)!=t.charCodeAt(e))return!1;return this.cursor+=i,!0},eq_s_b:function(i,t){if(this.cursor-this.limit_backward<i)return!1;for(var e=0;e<i;e++)if(r.charCodeAt(this.cursor-i+e)!=t.charCodeAt(e))return!1;return this.cursor-=i,!0},find_among:function(i,t){for(var e=0,s=t,n=this.cursor,u=this.limit,o=0,a=0,c=!1;;){for(var h=e+(s-e>>1),l=0,f=o<a?o:a,d=i[h],p=f;p<d.s_size;p++){if(n+f==u){l=-1;break}if(l=r.charCodeAt(n+f)-d.s[p])break;f++}if(l<0?(s=h,a=f):(e=h,o=f),s-e<=1){if(e>0||s==e||c)break;c=!0}}for(;;){var d=i[e];if(o>=d.s_size){if(this.cursor=n+d.s_size,!d.method)return d.result;var m=d.method();if(this.cursor=n+d.s_size,m)return d.result}if((e=d.substring_i)<0)return 0}},find_among_b:function(i,t){for(var e=0,s=t,n=this.cursor,u=this.limit_backward,o=0,a=0,c=!1;;){for(var h=e+(s-e>>1),l=0,f=o<a?o:a,d=i[h],p=d.s_size-1-f;p>=0;p--){if(n-f==u){l=-1;break}if(l=r.charCodeAt(n-1-f)-d.s[p])break;f++}if(l<0?(s=h,a=f):(e=h,o=f),s-e<=1){if(e>0||s==e||c)break;c=!0}}for(;;){var d=i[e];if(o>=d.s_size){if(this.cursor=n-d.s_size,!d.method)return d.result;var m=d.method();if(this.cursor=n-d.s_size,m)return d.result}if((e=d.substring_i)<0)return 0}},replace_s:function(i,t,e){var s=e.length-(t-i),n=r.substring(0,i),u=r.substring(t);return r=n+e+u,this.limit+=s,this.cursor>=t?this.cursor+=s:this.cursor>i&&(this.cursor=i),s},slice_check:function(){if(this.bra<0||this.bra>this.ket||this.ket>this.limit||this.limit>r.length)throw"faulty slice operation"},slice_from:function(r){this.slice_check(),this.replace_s(this.bra,this.ket,r)},slice_del:function(){this.slice_from("")},insert:function(r,i,t){var e=this.replace_s(r,i,t);r<=this.bra&&(this.bra+=e),r<=this.ket&&(this.ket+=e)},slice_to:function(){return this.slice_check(),r.substring(this.bra,this.ket)},eq_v_b:function(r){return this.eq_s_b(r.length,r)}}},addQueryParserWildcardNormalizer:function(r,i){if(r.Index&&r.Index.prototype&&r.Index.prototype.query&&r.QueryParser&&r.QueryParser.parseTerm&&r.QueryLexer){this.queryParserWildcardNormalizers||(this.queryParserWildcardNormalizers=[]);for(var t=0;t<this.queryParserWildcardNormalizers.length;t++)if(this.queryParserWildcardNormalizers[t].label===i.label)return;if(this.queryParserWildcardNormalizers.push(i),!this.queryParserWildcardNormalizerApplied){var e=this,s=r.Index.prototype.query,n=r.QueryParser.parseTerm;r.Index.prototype.query=function(r){var i=this;return s.call(this,function(t){return t._lunrLanguagesSearchPipeline=i.pipeline,r.call(this,t)})},r.QueryParser.parseTerm=function(i){var t=i.consumeLexeme;i.consumeLexeme=function(){var s=t.call(i);return s&&s.type===r.QueryLexer.TERM&&-1!==s.str.indexOf("*")?{type:s.type,str:e.applyQueryParserWildcardNormalizers(s.str,i.query),start:s.start,end:s.end}:s};try{return n(i)}finally{i.consumeLexeme=t}},this.queryParserWildcardNormalizerApplied=!0}}},applyQueryParserWildcardNormalizers:function(r,i){for(var t=this.queryParserWildcardNormalizers||[],e=i&&i._lunrLanguagesSearchPipeline,s=0;s<t.length;s++)e&&!this.pipelineContainsFunction(e,t[s].pipelineFunctionLabel)||(r=t[s](r));return r},pipelineContainsFunction:function(r,i){if(!i)return!0;if(!r._stack)return!1;for(var t=0;t<r._stack.length;t++)if(r._stack[t].label===i)return!0;return!1}},r.trimmerSupport={generateTrimmer:function(r){var i=r+"0-9",t=new RegExp("^[^"+i+"]+"),e=new RegExp("[^"+i+"]+$");return function(r){return"function"==typeof r.update?r.update(function(r){return r.replace(t,"").replace(e,"")}):r.replace(t,"").replace(e,"")}}}}});
;
!function(e,t){"function"==typeof define&&define.amd?define(t):"object"==typeof exports?module.exports=t():t()(e.lunr)}(this,function(){return function(e){e.multiLanguage=function(){for(var t=Array.prototype.slice.call(arguments),r=t.join("-"),i="",n=[],o=[],s=[],p="2"==e.version[0],u=e.tokenizer,h=0;h<t.length;++h)"en"==t[h]?(i+="\\w",n.unshift(e.stopWordFilter),n.push(e.stemmer),o.push(e.stemmer)):(i+=e[t[h]].wordCharacters,e[t[h]].stopWordFilter&&n.unshift(e[t[h]].stopWordFilter),e[t[h]].stemmer&&(n.push(e[t[h]].stemmer),o.push(e[t[h]].stemmer)),e[t[h]].tokenizer&&s.push(e[t[h]].tokenizer));var l=e.trimmerSupport.generateTrimmer(i);if(e.Pipeline.registerFunction(l,"lunr-multi-trimmer-"+r),n.unshift(l),s.length>0){var a=function(e,t){for(var r=u(e,t),i={},n=0;n<r.length;n++)i[r[n].toString()]=!0;for(var n=0;n<s.length;n++)for(var o=s[n](e,t),p=0;p<o.length;p++){var h=o[p],l=h.toString();i[l]||(i[l]=!0,r.push(h))}return r};e.tokenizer.registerFunction&&e.tokenizer.registerFunction(a,"lunr-multi-tokenizer-"+r)}return function(){this.pipeline.reset(),this.pipeline.add.apply(this.pipeline,n),a&&(p?this.tokenizer=a:(e.tokenizer&&(e.tokenizer=a),this.tokenizerFn&&(this.tokenizerFn=a))),this.searchPipeline&&(this.searchPipeline.reset(),this.searchPipeline.add.apply(this.searchPipeline,o))}}}});
;
/*!
 * Lunr languages, `French` language
 * https://github.com/MihaiValentin/lunr-languages
 *
 * Copyright 2014, Mihai Valentin
 * http://www.mozilla.org/MPL/
 */
/*!
 * based on
 * Snowball JavaScript Library v0.3
 * http://code.google.com/p/urim/
 * http://snowball.tartarus.org/
 *
 * Copyright 2010, Oleg Mazko
 * http://www.mozilla.org/MPL/
 */

!function(e,r){"function"==typeof define&&define.amd?define(r):"object"==typeof exports?module.exports=r():r()(e.lunr)}(this,function(){return function(e){if(void 0===e)throw new Error("Lunr is not present. Please include / require Lunr before this script.");if(void 0===e.stemmerSupport)throw new Error("Lunr stemmer support is not present. Please include / require Lunr stemmer support before this script.");e.fr=function(){this.pipeline.reset(),this.pipeline.add(e.fr.trimmer,e.fr.stopWordFilter,e.fr.accentFold,e.fr.stemmer),this.searchPipeline&&(this.searchPipeline.reset(),this.searchPipeline.add(e.fr.trimmer,e.fr.accentFold,e.fr.stemmer))},e.fr.wordCharacters="A-Za-zªºÀ-ÖØ-öø-ʸˠ-ˤᴀ-ᴥᴬ-ᵜᵢ-ᵥᵫ-ᵷᵹ-ᶾḀ-ỿⁱⁿₐ-ₜKÅℲⅎⅠ-ↈⱠ-ⱿꜢ-ꞇꞋ-ꞭꞰ-ꞷꟷ-ꟿꬰ-ꭚꭜ-ꭤﬀ-ﬆＡ-Ｚａ-ｚ",e.fr.trimmer=e.trimmerSupport.generateTrimmer(e.fr.wordCharacters),e.Pipeline.registerFunction(e.fr.trimmer,"trimmer-fr"),e.fr.stemmer=function(){var r=e.stemmerSupport.Among,i=e.stemmerSupport.SnowballProgram,s=new function(){function e(e,r,i){return!(!S.eq_s(1,e)||(S.ket=S.cursor,!S.in_grouping(I,97,251)))&&(S.slice_from(r),S.cursor=i,!0)}function s(e,r,i){return!!S.eq_s(1,e)&&(S.ket=S.cursor,S.slice_from(r),S.cursor=i,!0)}function n(){for(var r,i;;){if(r=S.cursor,S.in_grouping(I,97,251)){if(S.bra=S.cursor,i=S.cursor,e("u","U",r))continue;if(S.cursor=i,e("i","I",r))continue;if(S.cursor=i,s("y","Y",r))continue}if(S.cursor=r,S.bra=r,!e("y","Y",r)){if(S.cursor=r,S.eq_s(1,"q")&&(S.bra=S.cursor,s("u","U",r)))continue;if(S.cursor=r,r>=S.limit)return;S.cursor++}}}function t(){for(;!S.in_grouping(I,97,251);){if(S.cursor>=S.limit)return!0;S.cursor++}for(;!S.out_grouping(I,97,251);){if(S.cursor>=S.limit)return!0;S.cursor++}return!1}function u(){var e=S.cursor;if(q=S.limit,g=q,k=q,S.in_grouping(I,97,251)&&S.in_grouping(I,97,251)&&S.cursor<S.limit)S.cursor++;else if(S.cursor=e,!S.find_among(v,3)){S.cursor=e;do{if(S.cursor>=S.limit){S.cursor=q;break}S.cursor++}while(!S.in_grouping(I,97,251))}q=S.cursor,S.cursor=e,t()||(g=S.cursor,t()||(k=S.cursor))}function o(){for(var e,r;;){if(r=S.cursor,S.bra=r,!(e=S.find_among(F,4)))break;switch(S.ket=S.cursor,e){case 1:S.slice_from("i");break;case 2:S.slice_from("u");break;case 3:S.slice_from("y");break;case 4:if(S.cursor>=S.limit)return;S.cursor++}}}function c(){return q<=S.cursor}function a(){return g<=S.cursor}function l(){return k<=S.cursor}function w(){var e,r;if(S.ket=S.cursor,e=S.find_among_b(C,43)){switch(S.bra=S.cursor,e){case 1:if(!l())return!1;S.slice_del();break;case 2:if(!l())return!1;S.slice_del(),S.ket=S.cursor,S.eq_s_b(2,"ic")&&(S.bra=S.cursor,l()?S.slice_del():S.slice_from("iqU"));break;case 3:if(!l())return!1;S.slice_from("log");break;case 4:if(!l())return!1;S.slice_from("u");break;case 5:if(!l())return!1;S.slice_from("ent");break;case 6:if(!c())return!1;if(S.slice_del(),S.ket=S.cursor,e=S.find_among_b(z,6))switch(S.bra=S.cursor,e){case 1:l()&&(S.slice_del(),S.ket=S.cursor,S.eq_s_b(2,"at")&&(S.bra=S.cursor,l()&&S.slice_del()));break;case 2:l()?S.slice_del():a()&&S.slice_from("eux");break;case 3:l()&&S.slice_del();break;case 4:c()&&S.slice_from("i")}break;case 7:if(!l())return!1;if(S.slice_del(),S.ket=S.cursor,e=S.find_among_b(h,3))switch(S.bra=S.cursor,e){case 1:l()?S.slice_del():S.slice_from("abl");break;case 2:l()?S.slice_del():S.slice_from("iqU");break;case 3:l()&&S.slice_del()}break;case 8:if(!l())return!1;if(S.slice_del(),S.ket=S.cursor,S.eq_s_b(2,"at")&&(S.bra=S.cursor,l()&&(S.slice_del(),S.ket=S.cursor,S.eq_s_b(2,"ic")))){S.bra=S.cursor,l()?S.slice_del():S.slice_from("iqU");break}break;case 9:S.slice_from("eau");break;case 10:if(!a())return!1;S.slice_from("al");break;case 11:if(l())S.slice_del();else{if(!a())return!1;S.slice_from("eux")}break;case 12:if(!a()||!S.out_grouping_b(I,97,251))return!1;S.slice_del();break;case 13:return c()&&S.slice_from("ant"),!1;case 14:return c()&&S.slice_from("ent"),!1;case 15:return r=S.limit-S.cursor,S.in_grouping_b(I,97,251)&&c()&&(S.cursor=S.limit-r,S.slice_del()),!1}return!0}return!1}function f(){var e,r;if(S.cursor<q)return!1;if(r=S.limit_backward,S.limit_backward=q,S.ket=S.cursor,!(e=S.find_among_b(y,35)))return S.limit_backward=r,!1;if(S.bra=S.cursor,1==e){if(!S.out_grouping_b(I,97,251))return S.limit_backward=r,!1;S.slice_del()}return S.limit_backward=r,!0}function m(){var e,r,i;if(S.cursor<q)return!1;if(r=S.limit_backward,S.limit_backward=q,S.ket=S.cursor,!(e=S.find_among_b(E,38)))return S.limit_backward=r,!1;switch(S.bra=S.cursor,e){case 1:if(!l())return S.limit_backward=r,!1;S.slice_del();break;case 2:S.slice_del();break;case 3:S.slice_del(),i=S.limit-S.cursor,S.ket=S.cursor,S.eq_s_b(1,"e")?(S.bra=S.cursor,S.slice_del()):S.cursor=S.limit-i}return S.limit_backward=r,!0}function _(){var e,r,i,s,n=S.limit-S.cursor;if(S.ket=S.cursor,S.eq_s_b(1,"s")?(S.bra=S.cursor,r=S.limit-S.cursor,S.out_grouping_b(U,97,232)?(S.cursor=S.limit-r,S.slice_del()):S.cursor=S.limit-n):S.cursor=S.limit-n,S.cursor>=q){if(i=S.limit_backward,S.limit_backward=q,S.ket=S.cursor,e=S.find_among_b(P,7))switch(S.bra=S.cursor,e){case 1:if(l()){if(s=S.limit-S.cursor,!S.eq_s_b(1,"s")&&(S.cursor=S.limit-s,!S.eq_s_b(1,"t")))break;S.slice_del()}break;case 2:S.slice_from("i");break;case 3:S.slice_del();break;case 4:S.eq_s_b(2,"gu")&&S.slice_del()}S.limit_backward=i}}function d(){var e=S.limit-S.cursor;S.find_among_b(x,5)&&(S.cursor=S.limit-e,S.ket=S.cursor,S.cursor>S.limit_backward&&(S.cursor--,S.bra=S.cursor,S.slice_del()))}function b(){for(var e,r=1;S.out_grouping_b(I,97,251);)r--;if(r<=0){if(S.ket=S.cursor,e=S.limit-S.cursor,!S.eq_s_b(1,"é")&&(S.cursor=S.limit-e,!S.eq_s_b(1,"è")))return;S.bra=S.cursor,S.slice_from("e")}}function p(){if(!w()&&(S.cursor=S.limit,!f()&&(S.cursor=S.limit,!m())))return S.cursor=S.limit,void _();S.cursor=S.limit,S.ket=S.cursor,S.eq_s_b(1,"Y")?(S.bra=S.cursor,S.slice_from("i")):(S.cursor=S.limit,S.eq_s_b(1,"ç")&&(S.bra=S.cursor,S.slice_from("c")))}var k,g,q,v=[new r("col",-1,-1),new r("par",-1,-1),new r("tap",-1,-1)],F=[new r("",-1,4),new r("I",0,1),new r("U",0,2),new r("Y",0,3)],z=[new r("iqU",-1,3),new r("abl",-1,3),new r("Ièr",-1,4),new r("ièr",-1,4),new r("eus",-1,2),new r("iv",-1,1)],h=[new r("ic",-1,2),new r("abil",-1,1),new r("iv",-1,3)],C=[new r("iqUe",-1,1),new r("atrice",-1,2),new r("ance",-1,1),new r("ence",-1,5),new r("logie",-1,3),new r("able",-1,1),new r("isme",-1,1),new r("euse",-1,11),new r("iste",-1,1),new r("ive",-1,8),new r("if",-1,8),new r("usion",-1,4),new r("ation",-1,2),new r("ution",-1,4),new r("ateur",-1,2),new r("iqUes",-1,1),new r("atrices",-1,2),new r("ances",-1,1),new r("ences",-1,5),new r("logies",-1,3),new r("ables",-1,1),new r("ismes",-1,1),new r("euses",-1,11),new r("istes",-1,1),new r("ives",-1,8),new r("ifs",-1,8),new r("usions",-1,4),new r("ations",-1,2),new r("utions",-1,4),new r("ateurs",-1,2),new r("ments",-1,15),new r("ements",30,6),new r("issements",31,12),new r("ités",-1,7),new r("ment",-1,15),new r("ement",34,6),new r("issement",35,12),new r("amment",34,13),new r("emment",34,14),new r("aux",-1,10),new r("eaux",39,9),new r("eux",-1,1),new r("ité",-1,7)],y=[new r("ira",-1,1),new r("ie",-1,1),new r("isse",-1,1),new r("issante",-1,1),new r("i",-1,1),new r("irai",4,1),new r("ir",-1,1),new r("iras",-1,1),new r("ies",-1,1),new r("îmes",-1,1),new r("isses",-1,1),new r("issantes",-1,1),new r("îtes",-1,1),new r("is",-1,1),new r("irais",13,1),new r("issais",13,1),new r("irions",-1,1),new r("issions",-1,1),new r("irons",-1,1),new r("issons",-1,1),new r("issants",-1,1),new r("it",-1,1),new r("irait",21,1),new r("issait",21,1),new r("issant",-1,1),new r("iraIent",-1,1),new r("issaIent",-1,1),new r("irent",-1,1),new r("issent",-1,1),new r("iront",-1,1),new r("ît",-1,1),new r("iriez",-1,1),new r("issiez",-1,1),new r("irez",-1,1),new r("issez",-1,1)],E=[new r("a",-1,3),new r("era",0,2),new r("asse",-1,3),new r("ante",-1,3),new r("ée",-1,2),new r("ai",-1,3),new r("erai",5,2),new r("er",-1,2),new r("as",-1,3),new r("eras",8,2),new r("âmes",-1,3),new r("asses",-1,3),new r("antes",-1,3),new r("âtes",-1,3),new r("ées",-1,2),new r("ais",-1,3),new r("erais",15,2),new r("ions",-1,1),new r("erions",17,2),new r("assions",17,3),new r("erons",-1,2),new r("ants",-1,3),new r("és",-1,2),new r("ait",-1,3),new r("erait",23,2),new r("ant",-1,3),new r("aIent",-1,3),new r("eraIent",26,2),new r("èrent",-1,2),new r("assent",-1,3),new r("eront",-1,2),new r("ât",-1,3),new r("ez",-1,2),new r("iez",32,2),new r("eriez",33,2),new r("assiez",33,3),new r("erez",32,2),new r("é",-1,2)],P=[new r("e",-1,3),new r("Ière",0,2),new r("ière",0,2),new r("ion",-1,1),new r("Ier",-1,2),new r("ier",-1,2),new r("ë",-1,4)],x=[new r("ell",-1,-1),new r("eill",-1,-1),new r("enn",-1,-1),new r("onn",-1,-1),new r("ett",-1,-1)],I=[17,65,16,1,0,0,0,0,0,0,0,0,0,0,0,128,130,103,8,5],U=[1,65,20,0,0,0,0,0,0,0,0,0,0,0,0,0,128],S=new i;this.setCurrent=function(e){S.setCurrent(e)},this.getCurrent=function(){return S.getCurrent()},this.stem=function(){var e=S.cursor;return n(),S.cursor=e,u(),S.limit_backward=e,S.cursor=S.limit,p(),S.cursor=S.limit,d(),S.cursor=S.limit,b(),S.cursor=S.limit_backward,o(),!0}};return function(e){return"function"==typeof e.update?e.update(function(e){return s.setCurrent(e),s.stem(),s.getCurrent()}):(s.setCurrent(e),s.stem(),s.getCurrent())}}(),e.Pipeline.registerFunction(e.fr.stemmer,"stemmer-fr"),e.fr.accentFoldTerm=function(e){return e.replace(/[\u00E0\u00E1\u00E2\u00E4\u00C0\u00C1\u00C2\u00C4]/g,"a").replace(/[\u00E7\u00C7]/g,"c").replace(/[\u00E9\u00E8\u00EA\u00EB\u00C9\u00C8\u00CA\u00CB]/g,"e").replace(/[\u00EE\u00EF\u00CE\u00CF]/g,"i").replace(/[\u00F4\u00F6\u00D4\u00D6]/g,"o").replace(/[\u00F9\u00FB\u00FC\u00D9\u00DB\u00DC]/g,"u").replace(/[\u0178\u00FF]/g,"y").replace(/[\u00E6\u00C6]/g,"ae").replace(/[\u0153\u0152]/g,"oe")},e.fr.accentFold=function(r){return r?"function"==typeof r.update?r.update(function(r){return e.fr.accentFoldTerm(r)}):"string"==typeof r?e.fr.accentFoldTerm(r):r:r},e.Pipeline.registerFunction(e.fr.accentFold,"accentFold-fr"),e.fr.wildcardNormalizer=function(r){return e.fr.accentFoldTerm(r)},e.fr.wildcardNormalizer.label="wildcardNormalizer-fr",e.fr.wildcardNormalizer.pipelineFunctionLabel="stemmer-fr",e.stemmerSupport.addQueryParserWildcardNormalizer(e,e.fr.wildcardNormalizer),e.fr.stopWordFilter=e.generateStopWordFilter("ai aie aient aies ait as au aura aurai auraient aurais aurait auras aurez auriez aurions aurons auront aux avaient avais avait avec avez aviez avions avons ayant ayez ayons c ce ceci celà ces cet cette d dans de des du elle en es est et eu eue eues eurent eus eusse eussent eusses eussiez eussions eut eux eûmes eût eûtes furent fus fusse fussent fusses fussiez fussions fut fûmes fût fûtes ici il ils j je l la le les leur leurs lui m ma mais me mes moi mon même n ne nos notre nous on ont ou par pas pour qu que quel quelle quelles quels qui s sa sans se sera serai seraient serais serait seras serez seriez serions serons seront ses soi soient sois soit sommes son sont soyez soyons suis sur t ta te tes toi ton tu un une vos votre vous y à étaient étais était étant étiez étions été étée étées étés êtes".split(" ")),e.Pipeline.registerFunction(e.fr.stopWordFilter,"stopWordFilter-fr")}});
;
(function () {
  function ready(fn) {
    if (document.readyState == 'complete') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // the searchinput of the dedicated search page; its form may be copied into
  // the content, but only the search page lists results
  function getSearchinput() {
    return document.querySelector('#R-searchresults') && document.querySelector('.searchform input.search-by');
  }

  window.relearn = window.relearn || {};

  // the adapter tells it is ready by calling executeInitialSearch; until then a
  // search waits instead of answering, as the suggestions keep what they got
  var resolveSearchEngine;
  var searchEngineReady = new Promise(function (resolve) {
    resolveSearchEngine = resolve;
  });

  // the index may be large, so it is only loaded once a search is about to happen
  var isSearchEngineRequested = false;
  function requestSearchEngine() {
    if (isSearchEngineRequested || !window.relearn.search || !window.relearn.search.adapter) {
      return;
    }
    isSearchEngineRequested = true;
    // the adapters expect the index URL and its integrity as globals; our data block
    // is the same for every page, so it knows the index's path from the site's root
    // and we put the page's own way up there in front of it
    var config = JSON.parse(document.querySelector('#R-search-config').textContent);
    window.relearn.index_js_url = window.relearn.relBasePath + '/' + config.indexFile;
    window.relearn.index_js_integrity = config.indexIntegrity;
    window.relearn.search.adapter.init();
  }

  window.relearn.executeInitialSearch = function executeInitialSearch() {
    if (window.relearn.isSearchEngineReady) {
      resolveSearchEngine();
    }
    if (window.relearn.isSearchInterfaceReady && window.relearn.isSearchEngineReady) {
      var input = getSearchinput();
      if (!input) {
        return;
      }
      var value = input.value;
      executeSearch(value);
    }
  };

  window.relearn.executeTriggeredSearch = function executeTriggeredSearch() {
    var input = getSearchinput();
    if (!input) {
      return;
    }
    var value = input.value;
    executeSearch(value);

    // add a new entry to the history after the user
    // changed the term; this does not reload the page
    // but will add to the history and update the address bar URL
    var url = new URL(window.location);
    var oldValue = url.searchParams.get('search-by');
    if (value != oldValue) {
      var state = window.history.state || {};
      state = Object.assign({}, typeof state === 'object' ? state : {});
      url.searchParams.set('search-by', value);
      state.search = url.toString();
      // with normal pages, this is handled by the 'pagehide' event, but this
      // doesn't fire in case of pushState, so we have to do the same thing
      // here, too; we only need a simplified version of transferScrollToHistory
      // as the scroll position can be directly taken from the content element
      state.contentScrollTop = +elc.scrollTop;
      var scrollPositionKey = window.relearn.absBaseUri + '/scroll-position/' + document.querySelector('body').dataset.origin;
      window.history.pushState(state, '', url);
      window.sessionStorage.removeItem(scrollPositionKey);
    }
  };

  function executeHistorySearch(event) {
    // restart search if browsed through history
    if (event.state) {
      var state = window.history.state || {};
      state = Object.assign({}, typeof state === 'object' ? state : {});
      if (state.search) {
        var url = new URL(state.search);
        if (url.searchParams.has('search-by')) {
          var search = url.searchParams.get('search-by');

          // we have to insert the old search term into the inputs
          var inputs = document.querySelectorAll('input.search-by');
          inputs.forEach(function (e) {
            e.value = search;
            e.dispatchEvent(new Event('input'));
          });

          // recreate the last search results and eventually
          // restore the previous scrolling position
          executeSearch(search);
        }
      }
    }
  }

  function renderItem(item) {
    var page = item.page;
    var context = [];
    if (item.matches && item.matches.length) {
      var numContextWords = 2;
      var contextPattern = '(?:\\S+ +){0,' + numContextWords + '}\\S*\\b(?:' + escapeRegex(item.matches[0]) + ')\\b\\S*(?: +\\S+){0,' + numContextWords + '}';
      context = page.content.match(new RegExp(contextPattern, 'i'));
      if (!context) {
        item.matches.shift();
        var contextPattern = '(?:\\S+ +){0,' + numContextWords + '}\\S*\\b(?:' + item.matches.map(escapeRegex).join('|') + ')\\b\\S*(?: +\\S+){0,' + numContextWords + '}';
        context = page.content.match(new RegExp(contextPattern, 'i'));
      }
    }
    var divsuggestion = document.createElement('a');
    divsuggestion.className = 'autocomplete-suggestion';
    divsuggestion.setAttribute('href', window.relearn.relBaseUri + page.uri);
    var divlink = document.createElement('span');
    divlink.className = 'link';
    divlink.innerText = page.title;
    var divtitle = document.createElement('div');
    divtitle.className = 'title';
    // the mark in front of the title is decoration
    var spanmark = document.createElement('span');
    spanmark.setAttribute('aria-hidden', 'true');
    spanmark.innerText = '» ';
    divtitle.appendChild(spanmark);
    divtitle.appendChild(divlink);
    divsuggestion.appendChild(divtitle);
    var divbreadcrumb = document.createElement('div');
    divbreadcrumb.className = 'breadcrumbs';
    divbreadcrumb.innerText = page.breadcrumb || '';
    divsuggestion.appendChild(divbreadcrumb);
    if (context) {
      var divcontext = document.createElement('div');
      divcontext.className = 'context';
      divcontext.innerText = context || '';
      divsuggestion.appendChild(divcontext);
    }
    return divsuggestion;
  }

  function resolvePlaceholders(s, args) {
    var args = args || [];
    // use replace to iterate over the string
    // select the match and check if the related argument is present
    // if yes, replace the match with the argument
    return s.replace(/{([0-9]+)}/g, function (match, index) {
      // check if the argument is present
      return typeof args[index] == 'undefined' ? match : args[index];
    });
  }

  // how many suggestions there are is told without having to look at them
  function initStatus(list) {
    var status = document.createElement('div');
    status.className = 'a11y-only';
    status.setAttribute('role', 'status');
    list.insertAdjacentElement('afterend', status);
    return status;
  }

  function executeSearch(value) {
    var input = getSearchinput();

    var results = document.querySelector('#R-searchresults');
    var hint = document.querySelector('.searchhint');
    hint.innerText = '';
    results.textContent = '';
    // the print version searches for the term it is given with its URL
    var print = document.querySelector('.topbar-button-print a');
    if (print) {
      var printUrl = new URL(print.href);
      printUrl.searchParams.delete('search-by');
      if (value.length) {
        printUrl.searchParams.set('search-by', value);
      }
      print.href = printUrl;
    }
    (async function () {
      requestSearchEngine();
      await searchEngineReady;
      var a = await window.relearn.search.adapter.search(value);
      if (a.length) {
        hint.innerText = resolvePlaceholders(window.T_N_results_found, [value, a.length]);
        a.forEach(function (item) {
          results.appendChild(renderItem(item));
        });
        window.relearn.markSearch();
      } else if (value.length) {
        hint.innerText = resolvePlaceholders(window.T_No_results_found, [value]);
      }
      input.focus();

      // if we are initiating search because of a browser history
      // operation, we have to restore the scrolling postion the
      // user previously has used; if this search isn't initiated
      // by a browser history operation, it simply does nothing
      var state = window.history.state || {};
      state = Object.assign({}, typeof state === 'object' ? state : {});
      if (Object.hasOwn(state, 'contentScrollTop')) {
        window.setTimeout(function () {
          elc.scrollTop = +state.contentScrollTop;
        }, 10);
        return;
      }
    })();
  }

  function initSearchAfterLoad() {
    if (!window.relearn.search || !window.relearn.search.adapter) {
      return;
    }

    var input = getSearchinput();
    if (input) {
      // the search page is there to show results, so it needs the index right away
      requestSearchEngine();
      var state = window.history.state || {};
      state = Object.assign({}, typeof state === 'object' ? state : {});
      state.search = window.location.toString();
      window.history.replaceState(state, '');
    }

    // each search box gets its own suggestions and its own status
    document.querySelectorAll('.searchbox input.search-by').forEach(function (box) {
      // a reader putting the focus into the box is about to search, so the index
      // has its head start while the term is still typed
      box.addEventListener('focus', requestSearchEngine, { once: true });
      var status = null;
      new autoComplete({
        /* selector for the search box element */
        selectorToInsert: 'search:has(.searchbox)',
        selector: box,
        /* source is the callback to perform the search */
        source: async function (term, response) {
          requestSearchEngine();
          await searchEngineReady;
          let a = await window.relearn.search.adapter.search(term);
          response(a);
          if (status) {
            status.innerText = resolvePlaceholders(a.length ? window.T_N_results_found : window.T_No_results_found, [term, a.length]);
          }
        },
        /* renderItem displays individual search results */
        renderItem: function (item, _term) {
          return renderItem(item).outerHTML;
        },
        /* onSelect callback fires when a search suggestion is chosen */
        onSelect: function (e, term, item) {
          location.href = item.getAttribute('href');
          e.preventDefault();
        },
      });
      if (box.sc) {
        status = initStatus(box.sc);
      }
    });
  }

  function initSearch() {
    window.addEventListener('popstate', executeHistorySearch);

    var input = getSearchinput();
    if (input) {
      // search in place instead of reloading the page with the term in its URL
      input.form.addEventListener('submit', function (event) {
        event.preventDefault();
        window.relearn.executeTriggeredSearch();
      });
      input.addEventListener('keydown', function (event) {
        // if we are pressing ESC in the searchinput our focus will
        // be stolen by the other event handlers, so we have to refocus
        // here after a short while
        if (event.key == 'Escape') {
          setTimeout(function () {
            input.focus();
          }, 0);
        }
      });
    }
    ready(initSearchAfterLoad);
  }

  initSearch();
})();
