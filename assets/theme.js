/* BENCHMARK GUIDES — theme.js
   Small, dependency-free. Handles: mobile menu, localization auto-submit,
   scroll reveal, product variant picker, quantity, AJAX add-to-cart + toast,
   cart line updates, product gallery, address forms. */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const strings = window.themeStrings || {};
  const routes = window.routes || { cartAdd: '/cart/add', cartChange: '/cart/change', cart: '/cart', root: '/' };

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg, linkText, linkHref) {
    const el = $('#Toast');
    if (!el) return;
    el.innerHTML = '';
    el.append(document.createTextNode(msg));
    if (linkText && linkHref) {
      const a = document.createElement('a');
      a.href = linkHref; a.textContent = linkText;
      el.append(a);
    }
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 4200);
  }

  /* ---------- header ---------- */
  $$('[data-menu-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const header = btn.closest('.site-header');
      const open = header.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- localization ---------- */
  $$('[data-localization-form] [data-auto-submit]').forEach((sel) => {
    sel.addEventListener('change', () => sel.form.submit());
  });

  /* ---------- reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach((r, i) => { r.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`; io.observe(r); });
  } else {
    reveals.forEach((r) => r.classList.add('is-in'));
  }

  /* ---------- quantity steppers ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-qty-change]');
    if (!btn) return;
    const input = $('input', btn.closest('.qty'));
    const min = parseInt(input.min || '1', 10);
    let v = parseInt(input.value || '1', 10) + parseInt(btn.dataset.qtyChange, 10);
    if (v < min) v = min;
    input.value = v;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /* ---------- money formatting ---------- */
  function formatMoney(cents) {
    const fmt = (window.themeMoneyFormat || '${{amount}}');
    const amount = (cents / 100).toFixed(2);
    const [whole, dec] = amount.split('.');
    const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return fmt
      .replace(/\{\{\s*amount\s*\}\}/, `${withCommas}.${dec}`)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/, withCommas)
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`)
      .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/, whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
      .replace(/\{\{\s*amount_with_space_separator\s*\}\}/, `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')},${dec}`)
      .replace(/\{\{\s*amount_no_decimals_with_space_separator\s*\}\}/, whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
  }

  /* ---------- product form ---------- */
  $$('[data-product-form]').forEach((form) => {
    const section = form.closest('[data-product-section]') || document;
    const dataEl = $('[data-product-json]', section);
    const product = dataEl ? JSON.parse(dataEl.textContent) : null;
    const idInput = $('[name="id"]', form);
    const submit = $('[data-add-to-cart]', form);
    const submitText = $('[data-add-to-cart-text]', form) || submit;
    const priceEl = $('[data-price]', section);
    const skuEl = $('[data-sku]', section);
    const note = $('[data-cart-note]', section);
    const mainImg = $('[data-main-image]', section);

    function selectedOptions() {
      return $$('fieldset[data-option-index]', form).map((fs) => {
        const checked = $('input:checked', fs);
        if (checked) return checked.value;
        const sel = $('select', fs);
        return sel ? sel.value : null;
      });
    }

    function findVariant() {
      if (!product) return null;
      const opts = selectedOptions();
      if (!opts.length) return product.variants.find((v) => String(v.id) === idInput.value) || product.variants[0];
      return product.variants.find((v) => v.options.every((o, i) => o === opts[i])) || null;
    }

    function setState(variant) {
      if (!variant) {
        submit.disabled = true; submitText.textContent = strings.unavailable || 'Unavailable';
        return;
      }
      idInput.value = variant.id;
      if (variant.available) { submit.disabled = false; submitText.textContent = strings.addToCart || 'Add to cart'; }
      else { submit.disabled = true; submitText.textContent = strings.soldOut || 'Sold out'; }
      if (priceEl) {
        const cur = $('[data-price-current]', priceEl); const cmp = $('[data-price-compare]', priceEl);
        if (cur) cur.textContent = formatMoney(variant.price);
        if (cmp) {
          if (variant.compare_at_price && variant.compare_at_price > variant.price) { cmp.hidden = false; cmp.textContent = formatMoney(variant.compare_at_price); priceEl.classList.add('price--sale'); }
          else { cmp.hidden = true; priceEl.classList.remove('price--sale'); }
        }
      }
      if (skuEl && variant.sku) skuEl.textContent = variant.sku;
      if (mainImg && variant.featured_image && variant.featured_image.src) {
        mainImg.src = variant.featured_image.src; mainImg.removeAttribute('srcset');
      }
      if (window.history && window.history.replaceState) {
        const url = new URL(window.location.href); url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());
      }
    }

    form.addEventListener('change', (e) => {
      if (e.target.closest('fieldset[data-option-index]')) setState(findVariant());
    });

    form.addEventListener('submit', async (e) => {
      if (form.dataset.ajax === 'false') return;
      e.preventDefault();
      if (submit.disabled) return;
      submit.setAttribute('aria-disabled', 'true');
      const prev = submitText.textContent; submitText.textContent = strings.adding || '…';
      if (note) { note.textContent = ''; note.classList.remove('cart-note--error'); }
      try {
        const fd = new FormData(form);
        const res = await fetch(routes.cartAdd + '.js', { method: 'POST', body: fd, headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.description || data.message || strings.cartError);
        const cartRes = await fetch(routes.cart + '.js', { headers: { 'Accept': 'application/json' } });
        const cart = await cartRes.json();
        $$('[data-cart-count]').forEach((c) => { c.textContent = cart.item_count; c.dataset.count = cart.item_count; });
        toast(strings.addedToCart || 'Added to cart', strings.viewCart || 'View cart', routes.cart);
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
      } catch (err) {
        if (note) { note.textContent = err.message; note.classList.add('cart-note--error'); }
        else toast(err.message);
      } finally {
        submit.removeAttribute('aria-disabled'); submitText.textContent = prev;
      }
    });

    setState(findVariant());
  });

  /* ---------- product gallery thumbs ---------- */
  $$('[data-thumb]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const main = $('[data-main-image]', btn.closest('[data-product-section]') || document);
      if (!main) return;
      main.src = btn.dataset.src; main.srcset = btn.dataset.srcset || ''; main.alt = btn.dataset.alt || '';
      $$('[data-thumb]').forEach((b) => b.removeAttribute('aria-current'));
      btn.setAttribute('aria-current', 'true');
    });
  });

  /* ---------- cart page: line quantity changes ---------- */
  const cartForm = $('[data-cart-form]');
  if (cartForm) {
    let busy = false;
    async function change(line, quantity) {
      if (busy) return; busy = true;
      cartForm.setAttribute('aria-busy', 'true');
      try {
        const res = await fetch(routes.cartChange + '.js', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ line, quantity })
        });
        if (!res.ok) throw new Error(strings.cartError);
        window.location.reload();
      } catch (err) { toast(err.message); busy = false; cartForm.removeAttribute('aria-busy'); }
    }
    cartForm.addEventListener('change', (e) => {
      const input = e.target.closest('[data-line-qty]');
      if (input) change(parseInt(input.dataset.lineQty, 10), parseInt(input.value, 10) || 0);
    });
    cartForm.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-line-remove]');
      if (rm) { e.preventDefault(); change(parseInt(rm.dataset.lineRemove, 10), 0); }
    });
  }

  /* ---------- account: address forms ---------- */
  $$('[data-address-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.addressToggle);
      if (target) { target.classList.toggle('is-open'); btn.setAttribute('aria-expanded', target.classList.contains('is-open')); }
    });
  });
  $$('[data-address-delete]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!confirm(btn.dataset.confirm || 'Delete this address?')) return;
      const f = document.createElement('form');
      f.method = 'post'; f.action = btn.dataset.target;
      f.innerHTML = '<input type="hidden" name="_method" value="delete">';
      document.body.append(f); f.submit();
    });
  });
  if (window.Shopify && window.Shopify.CustomerAddress) {
    $$('[data-address-country]').forEach((sel) => {
      new window.Shopify.CountryProvinceSelector(sel.id, sel.dataset.addressCountry, { hideElement: sel.dataset.addressProvinceWrap });
    });
  }
})();
