/* ============================================================
   MELINDA KÜRTŐS — script.js
   ============================================================ */

// --- Noto Emoji img csere ---
var NOTO_BASE = 'https://fonts.gstatic.com/s/e/notoemoji/latest/{cp}/emoji.svg';
var EMOJI_MAP = {
    '🤤': '1f924', '😍': '1f60d', '😋': '1f60b', '😎': '1f60e',
    '🛒': '1f6d2', '📍': '1f4cd', '👋': '1f44b', '👀': '1f440',
    '🏆': '1f3c6', '🎉': '1f389', '🍽️': '1f37d_fe0f', '🍩': '1f369',
    '🌾': '1f33e', '❤️': '2764_fe0f', '✨': '2728', '🔥': '1f525', '🕐': '1f550',
};

function emojiImg(emoji, cp) {
    var url = NOTO_BASE.replace('{cp}', cp);
    return '<img src="' + url + '" alt="' + emoji + '" class="noto-emoji" width="20" height="20" aria-hidden="true">';
}

function replaceEmojis(text) {
    // Sort by length descending so multi-char emojis (❤️) are replaced first
    var entries = Object.keys(EMOJI_MAP).sort(function(a, b) { return b.length - a.length; });
    entries.forEach(function(emoji) {
        text = text.split(emoji).join(emojiImg(emoji, EMOJI_MAP[emoji]));
    });
    return text;
}

function applyEmojisToElement(el) {
    // Replace emoji chars in text nodes inside the element
    Array.from(el.childNodes).forEach(function(node) {
        if (node.nodeType === 3) { // text node
            var original = node.textContent;
            var hasEmoji = Object.keys(EMOJI_MAP).some(function(e) { return original.includes(e); });
            if (hasEmoji) {
                var span = document.createElement('span');
                span.innerHTML = replaceEmojis(original);
                node.parentNode.replaceChild(span, node);
            }
        }
    });
}

// --- Nyelvváltó ---
function changeLang(lang, flagClass) {
    document.querySelectorAll('.lang-text').forEach(function(el) {
        var val = el.getAttribute('data-' + lang);
        if (!val) return;
        var hasChildEl = Array.from(el.childNodes).some(function(n) { return n.nodeType === 1 && !n.classList.contains('noto-emoji'); });
        if (hasChildEl) {
            // Has non-emoji child elements — update only text nodes
            Array.from(el.childNodes).forEach(function(node) {
                if (node.nodeType === 3 && node.textContent.trim()) {
                    node.textContent = val + ' ';
                }
            });
        } else {
            // Set innerHTML with emoji replacement
            el.innerHTML = replaceEmojis(val);
        }
    });
    var flag = document.getElementById('current-lang-flag');
    if (flag && flagClass) flag.className = 'fi ' + flagClass;
    localStorage.setItem('selectedLang', lang);
    localStorage.setItem('selectedFlagClass', flagClass);
    var dd  = document.querySelector('.lang-dropdown-content');
    var btn = document.getElementById('current-lang-btn');
    if (dd)  dd.classList.remove('show');
    if (btn) btn.classList.remove('active');
}

// --- Tab váltó ---
function switchTab(targetId) {
    document.querySelectorAll('.menu-section').forEach(function(sec) {
        sec.classList.add('hidden');
    });
    document.querySelectorAll('.tab').forEach(function(btn) {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    var targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    var activeBtn = document.querySelector('.tab[data-target="' + targetId + '"]');
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-selected', 'true');
    }
}

document.addEventListener('DOMContentLoaded', function() {

    // --- Nyelv + Emoji ---
    var lang      = localStorage.getItem('selectedLang') || 'hu';
    var flagClass = localStorage.getItem('selectedFlagClass') || 'fi-hu';
    changeLang(lang, flagClass);

    // --- Hash alapú tab kiválasztás oldalbetöltéskor ---
    var hash = window.location.hash.replace('#', '');
    if (hash === 'kurtos' || hash === 'langos' || hash === 'fank') {
        switchTab(hash);
        setTimeout(function() {
            var tabsBar = document.querySelector('.tabs-bar');
            if (tabsBar) tabsBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    // --- Tab gombok ---
    document.querySelectorAll('.tab').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var target = btn.getAttribute('data-target');
            if (target) {
                switchTab(target);
                history.replaceState(null, '', '#' + target);
            }
        });
    });

    // --- Lang dropdown ---
    var langBtn     = document.getElementById('current-lang-btn');
    var langContent = document.querySelector('.lang-dropdown-content');
    if (langBtn && langContent) {
        langBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            langContent.classList.toggle('show');
            langBtn.classList.toggle('active');
        });
        window.addEventListener('click', function(e) {
            if (!langBtn.contains(e.target) && !langContent.contains(e.target)) {
                langContent.classList.remove('show');
                langBtn.classList.remove('active');
            }
        });
    }

    // --- Hamburger ---
    var hamburger = document.getElementById('hamburger');
    var navLinks  = document.getElementById('nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            var open = navLinks.classList.toggle('active');
            hamburger.classList.toggle('active', open);
            hamburger.setAttribute('aria-expanded', String(open));
        });
        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // --- Nav active eltávolítás ---
    document.querySelectorAll('.nav-links a').forEach(function(link) {
        link.addEventListener('click', function() {
            document.querySelectorAll('.nav-links a').forEach(function(l) {
                l.classList.remove('nav-active');
            });
        });
    });

    // --- Scroll reveal ---
    var revealEls = document.querySelectorAll('.menu-card, .cat-card, .about-grid, .section-intro, .map-wrap, .order-inner, .hours-grid');
    if ('IntersectionObserver' in window && revealEls.length) {
        revealEls.forEach(function(el) { el.classList.add('reveal'); });
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealEls.forEach(function(el) { observer.observe(el); });
    }

});