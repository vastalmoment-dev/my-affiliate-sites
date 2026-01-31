// script.js — shared site scripts (copy-to-clipboard and minimal UX)
// Keeps logic minimal, accessible and compatible with older browsers

(function () {
  'use strict';

  function copyText(text) {
    if (!text) return Promise.reject(new Error('No text'));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok ? Promise.resolve() : Promise.reject(new Error('execCommand failed'));
    } catch (err) {
      document.body.removeChild(ta);
      return Promise.reject(err);
    }
  }

  function setTempFeedback(btn, message, timeout, revertText) {
    var previous = btn.textContent;
    btn.textContent = message;
    btn.classList.add('copied');
    btn.setAttribute('aria-live', 'polite');
    clearTimeout(btn._copyTimeout);
    btn._copyTimeout = setTimeout(function () {
      btn.textContent = revertText || previous;
      btn.classList.remove('copied');
      btn.removeAttribute('aria-live');
    }, timeout || 1800);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.copy-btn');
    if (!btn) return;
    var code = btn.getAttribute('data-code');
    // If data-code isn't present, try to find nearest promo-box text
    if (!code) {
      var box = btn.previousElementSibling;
      if (box && box.classList && box.classList.contains('promo-box')) code = box.textContent.trim();
    }
    if (!code) return;

    copyText(code).then(function () {
      setTempFeedback(btn, 'Copied ✓', 1800, 'COPY');
    }).catch(function () {
      setTempFeedback(btn, 'Copy failed', 1400, 'COPY');
    });
  });

  // Match copy button size to promo box size (width & height)
  function matchCopyButtonSize(){
    document.querySelectorAll('.promo-row').forEach(function(row){
      var promo = row.querySelector('.promo-box');
      var btn = row.querySelector('.copy-btn');
      if(!promo || !btn) return;
      // Reset any forced width on very small screens to allow 100% rule to apply
      if(window.innerWidth <= 420){ btn.style.width = ''; btn.style.height = ''; var logoSmall = row.querySelector('.logo-inline'); if(logoSmall){ logoSmall.style.width = ''; logoSmall.style.height = ''; } return; }
      var rect = promo.getBoundingClientRect();
      // Use computed dimensions (round to avoid subpixel blurriness)
      btn.style.width = Math.round(rect.width) + 'px';
      btn.style.height = Math.round(rect.height) + 'px';
      var logo = row.querySelector('.logo-inline');
      if(logo){
        // Make the inline logo match the COPY button width & height so they align exactly.
        var btnRect = btn.getBoundingClientRect();
        logo.style.width = Math.round(btnRect.width) + 'px';
        logo.style.height = Math.round(btnRect.height) + 'px';
        logo.style.objectFit = 'cover';
        // Copy the computed border radius from the button so visuals match precisely
        try{
          var btnStyle = window.getComputedStyle(btn);
          logo.style.borderRadius = btnStyle.borderRadius || getComputedStyle(document.documentElement).getPropertyValue('--promo-radius') || '10px';
        }catch(e){}
      }
    });
  }

  var resizeTimeout;
  function onResize(){ clearTimeout(resizeTimeout); resizeTimeout = setTimeout(matchCopyButtonSize, 120); }

  window.addEventListener('resize', onResize);
  window.addEventListener('load', matchCopyButtonSize);
  document.addEventListener('DOMContentLoaded', matchCopyButtonSize);

})();
