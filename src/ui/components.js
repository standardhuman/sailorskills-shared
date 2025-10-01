/**
 * Shared UI Components
 * Reusable components across all Sailor Skills products
 */

/**
 * Create a button element
 * @param {Object} options - Button configuration
 * @returns {HTMLElement} Button element
 */
export function createButton(options = {}) {
  const {
    text = 'Button',
    variant = 'primary', // primary, secondary, danger, success
    size = 'medium', // small, medium, large
    onClick = null,
    disabled = false,
    icon = null,
    className = ''
  } = options;

  const button = document.createElement('button');
  button.className = `ss-btn ss-btn-${variant} ss-btn-${size} ${className}`.trim();
  button.textContent = text;
  button.disabled = disabled;

  if (icon) {
    const iconSpan = document.createElement('span');
    iconSpan.className = 'ss-btn-icon';
    iconSpan.textContent = icon;
    button.insertBefore(iconSpan, button.firstChild);
  }

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}

/**
 * Create a modal
 * @param {Object} options - Modal configuration
 * @returns {Object} Modal elements and methods
 */
export function createModal(options = {}) {
  const {
    title = 'Modal',
    content = '',
    footer = null,
    size = 'medium', // small, medium, large
    closeOnBackdrop = true,
    showCloseButton = true,
    onClose = null
  } = options;

  // Create modal structure
  const overlay = document.createElement('div');
  overlay.className = 'ss-modal-overlay';

  const modal = document.createElement('div');
  modal.className = `ss-modal ss-modal-${size}`;

  const header = document.createElement('div');
  header.className = 'ss-modal-header';

  const titleEl = document.createElement('h3');
  titleEl.className = 'ss-modal-title';
  titleEl.textContent = title;
  header.appendChild(titleEl);

  if (showCloseButton) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ss-modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => close());
    header.appendChild(closeBtn);
  }

  const body = document.createElement('div');
  body.className = 'ss-modal-body';

  if (typeof content === 'string') {
    body.innerHTML = content;
  } else {
    body.appendChild(content);
  }

  modal.appendChild(header);
  modal.appendChild(body);

  if (footer) {
    const footerEl = document.createElement('div');
    footerEl.className = 'ss-modal-footer';
    if (typeof footer === 'string') {
      footerEl.innerHTML = footer;
    } else {
      footerEl.appendChild(footer);
    }
    modal.appendChild(footerEl);
  }

  overlay.appendChild(modal);

  // Close on backdrop click
  if (closeOnBackdrop) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close();
      }
    });
  }

  function open() {
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('ss-modal-open'), 10);
  }

  function close() {
    overlay.classList.remove('ss-modal-open');
    setTimeout(() => {
      overlay.remove();
      if (onClose) onClose();
    }, 300);
  }

  function setContent(newContent) {
    if (typeof newContent === 'string') {
      body.innerHTML = newContent;
    } else {
      body.innerHTML = '';
      body.appendChild(newContent);
    }
  }

  return {
    overlay,
    modal,
    header,
    body,
    open,
    close,
    setContent
  };
}

/**
 * Create a loading spinner
 * @param {Object} options - Spinner configuration
 * @returns {HTMLElement} Spinner element
 */
export function createSpinner(options = {}) {
  const {
    size = 'medium', // small, medium, large
    color = 'primary',
    text = null
  } = options;

  const spinner = document.createElement('div');
  spinner.className = `ss-spinner ss-spinner-${size} ss-spinner-${color}`;

  const spinnerCircle = document.createElement('div');
  spinnerCircle.className = 'ss-spinner-circle';
  spinner.appendChild(spinnerCircle);

  if (text) {
    const spinnerText = document.createElement('div');
    spinnerText.className = 'ss-spinner-text';
    spinnerText.textContent = text;
    spinner.appendChild(spinnerText);
  }

  return spinner;
}

/**
 * Create a toast notification
 * @param {Object} options - Toast configuration
 * @returns {Object} Toast methods
 */
export function createToast(options = {}) {
  const {
    message = '',
    type = 'info', // success, error, warning, info
    duration = 3000,
    position = 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
    showClose = true
  } = options;

  const toast = document.createElement('div');
  toast.className = `ss-toast ss-toast-${type} ss-toast-${position}`;

  const messageEl = document.createElement('div');
  messageEl.className = 'ss-toast-message';
  messageEl.textContent = message;
  toast.appendChild(messageEl);

  if (showClose) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ss-toast-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => close());
    toast.appendChild(closeBtn);
  }

  function show() {
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('ss-toast-show'), 10);

    if (duration > 0) {
      setTimeout(() => close(), duration);
    }
  }

  function close() {
    toast.classList.remove('ss-toast-show');
    setTimeout(() => toast.remove(), 300);
  }

  return { toast, show, close };
}

/**
 * Create a form input group
 * @param {Object} options - Input configuration
 * @returns {HTMLElement} Input group element
 */
export function createFormInput(options = {}) {
  const {
    type = 'text',
    id = '',
    name = '',
    label = '',
    placeholder = '',
    required = false,
    value = '',
    error = '',
    helpText = '',
    className = ''
  } = options;

  const group = document.createElement('div');
  group.className = `ss-form-group ${className}`.trim();

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className = 'ss-form-label';
    labelEl.textContent = label;
    if (required) {
      const req = document.createElement('span');
      req.className = 'ss-form-required';
      req.textContent = '*';
      labelEl.appendChild(req);
    }
    if (id) labelEl.setAttribute('for', id);
    group.appendChild(labelEl);
  }

  const input = document.createElement('input');
  input.type = type;
  input.className = 'ss-form-input';
  if (id) input.id = id;
  if (name) input.name = name;
  if (placeholder) input.placeholder = placeholder;
  if (required) input.required = true;
  if (value) input.value = value;
  group.appendChild(input);

  if (helpText) {
    const help = document.createElement('small');
    help.className = 'ss-form-help';
    help.textContent = helpText;
    group.appendChild(help);
  }

  if (error) {
    const errorEl = document.createElement('div');
    errorEl.className = 'ss-form-error';
    errorEl.textContent = error;
    group.appendChild(errorEl);
    input.classList.add('ss-form-input-error');
  }

  return group;
}

/**
 * Show toast notification (convenience function)
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {number} duration - Duration in ms
 */
export function showToast(message, type = 'info', duration = 3000) {
  const toast = createToast({ message, type, duration });
  toast.show();
}
