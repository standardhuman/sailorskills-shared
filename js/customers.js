/**
 * Customer Management Page
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { createHeroHeader } from '../shared/src/ui/components.js';

// Supabase configuration
const SUPABASE_URL = 'https://fzygakldvvzxmahkdylq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6eWdha2xkdnZ6eG1haGtkeWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwODM4OTgsImV4cCI6MjA2OTY1OTg5OH0.8BNDF5zmpk2HFdprTjsdOWTDh_XkAPdTnGo7omtiVIk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State
let allCustomers = [];
let filteredCustomers = [];

/**
 * Format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Load all customers
 */
async function loadCustomers() {
  try {
    const listContainer = document.getElementById('customer-list');
    listContainer.innerHTML = '<div class="widget-loading">Loading customers...</div>';

    // Get customers with related data including full boat details
    let { data: customers, error } = await supabase
      .from('customers')
      .select(`
        id,
        name,
        email,
        phone,
        created_at,
        payments(amount, status, payment_date),
        service_orders(id, estimated_amount, created_at),
        boats(id, name, make, model, length, type, dock, slip, marina)
      `);

    // If query fails due to missing tables, try without related data
    if (error && error.code === '42703') {
      console.warn('⚠️ Related tables missing, loading customers only:', error.message);
      const simpleQuery = await supabase
        .from('customers')
        .select('id, name, email, phone, created_at');

      if (simpleQuery.error) throw simpleQuery.error;
      customers = simpleQuery.data;

      // Show warning to user
      listContainer.innerHTML = `
        <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
          ⚠️ <strong>Database Setup Required:</strong> Some tables are missing (boats, payments, service_orders).
          <a href="/database/schema.sql" target="_blank" style="color: #0066cc;">Run the schema.sql migration</a> to enable full functionality.
        </div>
      `;
    } else if (error) {
      throw error;
    }

    // Calculate metrics for each customer
    allCustomers = (customers || []).map(customer => {
      const payments = customer.payments || [];
      const successfulPayments = payments.filter(p => p.status === 'succeeded');
      const ltv = successfulPayments.reduce((sum, p => sum + parseFloat(p.amount || 0), 0);
      const orderCount = successfulPayments.length;
      const boatCount = (customer.boats || []).length;

      // Get last activity date
      const lastActivityDate = successfulPayments.length > 0
        ? new Date(Math.max(...successfulPayments.map(p => new Date(p.payment_date))))
        : new Date(customer.created_at);

      // Extract primary boat information (first boat if multiple)
      const primaryBoat = (customer.boats || [])[0] || {};
      const boatMake = primaryBoat.make || '';
      const boatModel = primaryBoat.model || '';
      const boatLength = primaryBoat.length || '';
      const boatType = primaryBoat.type || '';
      const marina = primaryBoat.marina || '';
      const dock = primaryBoat.dock || '';
      const slip = primaryBoat.slip || '';

      return {
        ...customer,
        ltv,
        orderCount,
        boatCount,
        lastActivityDate,
        boatMake,
        boatModel,
        boatLength,
        boatType,
        marina,
        dock,
        slip
      };
    });

    filteredCustomers = [...allCustomers];

    // Update stats
    updateStats();

    // Render customer list
    renderCustomerList();

  } catch (error) {
    console.error('Error loading customers:', error);
    document.getElementById('customer-list').innerHTML =
      '<div class="widget-error">Failed to load customers</div>';
  }
}

/**
 * Update statistics
 */
function updateStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const totalCustomers = allCustomers.length;
  const activeCustomers = allCustomers.filter(c => c.lastActivityDate >= thirtyDaysAgo).length;
  const totalLTV = allCustomers.reduce((sum, c) => sum + c.ltv, 0);
  const avgLTV = totalCustomers > 0 ? totalLTV / totalCustomers : 0;

  document.getElementById('total-customers').textContent = totalCustomers;
  document.getElementById('active-customers').textContent = activeCustomers;
  document.getElementById('avg-ltv').textContent = formatCurrency(avgLTV);
}

/**
 * Render customer list
 */
function renderCustomerList() {
  const listContainer = document.getElementById('customer-list');

  if (filteredCustomers.length === 0) {
    listContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 2rem;">No customers found</p>';
    return;
  }

  listContainer.innerHTML = filteredCustomers.map(customer => `
    <div class="customer-list-item" onclick="showCustomerDetail('${customer.id}')">
      <div class="customer-main-info">
        <div class="customer-list-name">${customer.name || 'Unknown'}</div>
        <div class="customer-list-email">${customer.email || ''}</div>
      </div>
      <div class="customer-meta">
        <div class="customer-stat">
          <div class="customer-stat-value">${formatCurrency(customer.ltv)}</div>
          <div class="customer-stat-label">Lifetime Value</div>
        </div>
        <div class="customer-stat">
          <div class="customer-stat-value">${customer.orderCount}</div>
          <div class="customer-stat-label">Orders</div>
        </div>
        <div class="customer-stat">
          <div class="customer-stat-value">${customer.boatCount}</div>
          <div class="customer-stat-label">Boats</div>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Search customers
 */
function searchCustomers(query) {
  const lowerQuery = query.toLowerCase();
  filteredCustomers = allCustomers.filter(customer => {
    const nameMatch = (customer.name || '').toLowerCase().includes(lowerQuery);
    const emailMatch = (customer.email || '').toLowerCase().includes(lowerQuery);
    return nameMatch || emailMatch;
  });
  renderCustomerList();
}

/**
 * Sort customers
 */
function sortCustomers(sortBy) {
  switch(sortBy) {
    case 'name':
      filteredCustomers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      break;
    case 'ltv':
      filteredCustomers.sort((a, b) => b.ltv - a.ltv);
      break;
    case 'recent':
      filteredCustomers.sort((a, b) => b.lastActivityDate - a.lastActivityDate);
      break;
    case 'orders':
      filteredCustomers.sort((a, b) => b.orderCount - a.orderCount);
      break;
  }
  renderCustomerList();
}

/**
 * Show customer detail modal
 */
window.showCustomerDetail = async function(customerId) {
  try {
    const modal = document.getElementById('customer-modal');
    const detailContainer = document.getElementById('customer-detail');

    modal.classList.remove('hidden');
    detailContainer.innerHTML = '<div class="widget-loading">Loading customer details...</div>';

    // Get customer with all related data including full boat details
    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        *,
        payments(amount, status, payment_date),
        service_orders(id, order_number, service_type, estimated_amount, status, created_at),
        boats(id, name, make, model, length, type, dock, slip, marina)
      `)
      .eq('id', customerId)
      .single();

    if (error) throw error;

    // Calculate metrics
    const successfulPayments = (customer.payments || []).filter(p => p.status === 'succeeded');
    const ltv = successfulPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const avgOrderValue = successfulPayments.length > 0 ? ltv / successfulPayments.length : 0;

    // Render customer detail
    detailContainer.innerHTML = `
      <div class="customer-detail-header">
        <div class="customer-detail-name">${customer.name || 'Unknown'}</div>
        <div class="customer-detail-email">${customer.email || ''}</div>
        ${customer.phone ? `<div style="color: var(--text-secondary); margin-top: 0.5rem;">📞 ${customer.phone}</div>` : ''}
      </div>

      <div class="customer-detail-stats">
        <div class="detail-stat-card">
          <div class="detail-stat-value">${formatCurrency(ltv)}</div>
          <div class="detail-stat-label">Lifetime Value</div>
        </div>
        <div class="detail-stat-card">
          <div class="detail-stat-value">${successfulPayments.length}</div>
          <div class="detail-stat-label">Total Orders</div>
        </div>
        <div class="detail-stat-card">
          <div class="detail-stat-value">${formatCurrency(avgOrderValue)}</div>
          <div class="detail-stat-label">Avg Order Value</div>
        </div>
        <div class="detail-stat-card">
          <div class="detail-stat-value">${(customer.boats || []).length}</div>
          <div class="detail-stat-label">Boats</div>
        </div>
      </div>

      ${(customer.boats || []).length > 0 ? `
        <div class="customer-detail-section">
          <h3>⛵ Boats</h3>
          <div class="boat-list">
            ${customer.boats.map(boat => `
              <div class="boat-card">
                <div class="boat-name">${boat.name || 'Unnamed'}</div>
                <div class="boat-details">
                  ${boat.make ? `<strong>Make/Model:</strong> ${boat.make} ${boat.model || ''}<br>` : ''}
                  ${boat.length ? `<strong>Length:</strong> ${boat.length}ft` : ''} ${boat.type ? `• <strong>Type:</strong> ${boat.type}<br>` : ''}
                  ${boat.marina ? `<strong>Marina:</strong> ${boat.marina}<br>` : ''}
                  ${boat.dock || boat.slip ? `<strong>Location:</strong> ${[boat.dock ? `Dock ${boat.dock}` : '', boat.slip ? `Slip ${boat.slip}` : ''].filter(Boolean).join(', ')}` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${(customer.service_orders || []).length > 0 ? `
        <div class="customer-detail-section">
          <h3>📋 Recent Orders</h3>
          <div class="order-list">
            ${customer.service_orders.slice(0, 5).map(order => `
              <div class="order-card">
                <div class="order-number">Order #${order.order_number || order.id.slice(0, 8)}</div>
                <div class="order-details">
                  Service: ${order.service_type?.replace(/_/g, ' ') || 'Unknown'}<br>
                  Amount: ${formatCurrency(order.estimated_amount || 0)}<br>
                  Status: ${order.status || 'Unknown'}<br>
                  Date: ${new Date(order.created_at).toLocaleDateString()}
                </div>
              </div>
            `).join('')}
          </div>
          <a href="https://sailorskills-billing.vercel.app/admin.html?customer_id=${customer.id}" target="_blank" class="link-to-product">
            View All Orders in Billing →
          </a>
        </div>
      ` : ''}
    `;

  } catch (error) {
    console.error('Error loading customer detail:', error);
    document.getElementById('customer-detail').innerHTML =
      '<div class="widget-error">Failed to load customer details</div>';
  }
};

/**
 * Close customer detail modal
 */
window.closeCustomerModal = function() {
  document.getElementById('customer-modal').classList.add('hidden');
};

// Close modal when clicking backdrop
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    closeCustomerModal();
  }
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Search
  const searchInput = document.getElementById('customer-search');
  searchInput.addEventListener('input', (e) => {
    searchCustomers(e.target.value);
  });

  // Sort
  const sortSelect = document.getElementById('sort-by');
  sortSelect.addEventListener('change', (e) => {
    sortCustomers(e.target.value);
  });
}

/**
 * Initialize page
 */
function initCustomersPage() {
  console.log('🚀 Loading Customer Management...');

  // Inject hero header
  const heroContainer = document.getElementById('hero-header-container');
  if (heroContainer) {
    const heroHeader = createHeroHeader({
      brand: 'SAILOR SKILLS',
      service: 'ADMIN',
      tagline: 'Customer Management',
      subtitle: 'View and manage all customers'
    });
    heroContainer.appendChild(heroHeader);
  }

  setupEventListeners();
  setupDataTableEventListeners();
  setupTabSwitching();
  loadCustomers();
}

// Wait for authentication before loading
document.addEventListener('admin-authenticated', (event) => {
  console.log('🎯 Received admin-authenticated event', event.detail);
  initCustomersPage();
});

// Also check if already authenticated (in case event fired before module loaded)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  // DOM is ready, check if user is already authenticated
  setTimeout(() => {
    const authCheck = document.querySelector('.global-nav, .logout-btn');
    if (authCheck && !document.querySelector('.customer-list-item')) {
      console.log('🔄 Already authenticated, initializing customer page...');
      initCustomersPage();
    }
  }, 100);
}

// ============================================================================
// DATA TABLE FUNCTIONALITY
// ============================================================================

// Data table column configuration
const DATA_TABLE_COLUMNS = [
  // Customer Info
  { key: 'name', label: 'Name', visible: true, sortable: true, width: '200px' },
  { key: 'email', label: 'Email', visible: true, sortable: true, width: '250px' },
  { key: 'phone', label: 'Phone', visible: true, sortable: true, width: '150px' },

  // Boat Information
  { key: 'boatMake', label: 'Boat Make', visible: false, sortable: true, width: '150px' },
  { key: 'boatModel', label: 'Boat Model', visible: false, sortable: true, width: '150px' },
  { key: 'boatLength', label: 'Boat Length (ft)', visible: false, sortable: true, width: '120px', type: 'number' },
  { key: 'boatType', label: 'Boat Type', visible: false, sortable: true, width: '130px' },

  // Location Information
  { key: 'marina', label: 'Marina', visible: false, sortable: true, width: '180px' },
  { key: 'dock', label: 'Dock', visible: false, sortable: true, width: '100px' },
  { key: 'slip', label: 'Slip', visible: false, sortable: true, width: '100px' },

  // Financial Metrics
  { key: 'ltv', label: 'Lifetime Value', visible: true, sortable: true, width: '150px', type: 'currency' },
  { key: 'orderCount', label: 'Total Orders', visible: true, sortable: true, width: '120px', type: 'number' },
  { key: 'boatCount', label: 'Boats', visible: true, sortable: true, width: '100px', type: 'number' },
  { key: 'avgOrderValue', label: 'Avg Order Value', visible: false, sortable: true, width: '150px', type: 'currency' },
  { key: 'totalPaid', label: 'Total Paid', visible: false, sortable: true, width: '150px', type: 'currency' },
  { key: 'pendingAmount', label: 'Pending Amount', visible: false, sortable: true, width: '150px', type: 'currency' },

  // Dates
  { key: 'lastActivityDate', label: 'Last Activity', visible: true, sortable: true, width: '150px', type: 'date' },
  { key: 'created_at', label: 'Customer Since', visible: true, sortable: true, width: '150px', type: 'date' }
];

// Data table state
let dataTableState = {
  data: [],
  filteredData: [],
  displayData: [],
  currentPage: 1,
  rowsPerPage: 50,
  sortColumn: 'name',
  sortDirection: 'asc',
  filters: {},
  searchQuery: ''
};

/**
 * Setup tab switching
 */
function setupTabSwitching() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');

      // Update active states
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      button.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');

      // Load data table if switching to it for the first time
      if (tabName === 'datatable' && dataTableState.data.length === 0) {
        loadDataTable();
      }
    });
  });
}

/**
 * Setup data table event listeners
 */
function setupDataTableEventListeners() {
  // Search
  const searchInput = document.getElementById('datatable-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      dataTableState.searchQuery = e.target.value;
      dataTableState.currentPage = 1;
      applyFiltersAndRender();
    });
  }

  // Filter toggle
  const filterToggle = document.getElementById('filter-toggle');
  const filterPanel = document.getElementById('filter-panel');
  if (filterToggle) {
    filterToggle.addEventListener('click', () => {
      filterPanel.classList.toggle('hidden');
    });
  }

  // Column toggle
  const columnsToggle = document.getElementById('columns-toggle');
  const columnPanel = document.getElementById('column-panel');
  if (columnsToggle) {
    columnsToggle.addEventListener('click', () => {
      columnPanel.classList.toggle('hidden');
    });
  }

  // Apply filters
  const applyFilters = document.getElementById('apply-filters');
  if (applyFilters) {
    applyFilters.addEventListener('click', () => {
      collectFilters();
      dataTableState.currentPage = 1;
      applyFiltersAndRender();
    });
  }

  // Clear filters
  const clearFilters = document.getElementById('clear-filters');
  if (clearFilters) {
    clearFilters.addEventListener('click', () => {
      document.getElementById('filter-date-start').value = '';
      document.getElementById('filter-date-end').value = '';
      document.getElementById('filter-ltv-min').value = '';
      document.getElementById('filter-ltv-max').value = '';
      document.getElementById('filter-orders-min').value = '';
      document.getElementById('filter-has-boats').value = '';
      dataTableState.filters = {};
      dataTableState.searchQuery = '';
      dataTableState.currentPage = 1;
      applyFiltersAndRender();
    });
  }

  // Rows per page
  const rowsPerPage = document.getElementById('rows-per-page');
  if (rowsPerPage) {
    rowsPerPage.addEventListener('change', (e) => {
      dataTableState.rowsPerPage = e.target.value === 'all' ? 9999999 : parseInt(e.target.value);
      dataTableState.currentPage = 1;
      renderDataTable();
    });
  }

  // Pagination
  const prevPage = document.getElementById('prev-page');
  const nextPage = document.getElementById('next-page');
  if (prevPage) {
    prevPage.addEventListener('click', () => {
      if (dataTableState.currentPage > 1) {
        dataTableState.currentPage--;
        renderDataTable();
      }
    });
  }
  if (nextPage) {
    nextPage.addEventListener('click', () => {
      const totalPages = Math.ceil(dataTableState.filteredData.length / dataTableState.rowsPerPage);
      if (dataTableState.currentPage < totalPages) {
        dataTableState.currentPage++;
        renderDataTable();
      }
    });
  }

  // Export buttons
  const exportCsv = document.getElementById('export-csv');
  const exportExcel = document.getElementById('export-excel');
  if (exportCsv) {
    exportCsv.addEventListener('click', exportToCSV);
  }
  if (exportExcel) {
    exportExcel.addEventListener('click', exportToExcel);
  }
}

/**
 * Load data for data table
 */
async function loadDataTable() {
  try {
    console.log('📊 Loading data table, allCustomers.length:', allCustomers.length);

    // Reuse the allCustomers data if already loaded
    if (allCustomers.length > 0) {
      dataTableState.data = allCustomers.map(customer => {
        // Check if we have raw payments array or already-calculated values
        if (customer.payments && Array.isArray(customer.payments)) {
          // Fresh data with payments array - calculate everything
          const payments = customer.payments;
          const successfulPayments = payments.filter(p => p.status === 'succeeded');
          const totalPaid = successfulPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
          const pendingPayments = payments.filter(p => p.status === 'pending');
          const pendingAmount = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
          const avgOrderValue = successfulPayments.length > 0 ? totalPaid / successfulPayments.length : 0;

          return {
            ...customer,
            totalPaid,
            pendingAmount,
            avgOrderValue
          };
        } else {
          // Already-processed data from allCustomers - use existing values
          const totalPaid = customer.ltv || 0;
          const pendingAmount = 0; // Not calculated in overview tab
          const avgOrderValue = customer.orderCount > 0 ? totalPaid / customer.orderCount : 0;

          // Boat data is already extracted in allCustomers
          return {
            ...customer,
            totalPaid,
            pendingAmount,
            avgOrderValue
          };
        }
      });
      console.log(`✅ Data table populated from allCustomers: ${dataTableState.data.length} rows`);
    } else {
      // Load customers for the first time (including full boat details)
      const { data: customers, error } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          email,
          phone,
          created_at,
          payments(amount, status, payment_date),
          service_orders(id, estimated_amount, created_at),
          boats(id, name, make, model, length, type, dock, slip, marina)
        `);

      if (error) throw error;

      dataTableState.data = (customers || []).map(customer => {
        const payments = customer.payments || [];
        const successfulPayments = payments.filter(p => p.status === 'succeeded');
        const ltv = successfulPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const orderCount = successfulPayments.length;
        const boatCount = (customer.boats || []).length;
        const pendingPayments = payments.filter(p => p.status === 'pending');
        const pendingAmount = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const avgOrderValue = successfulPayments.length > 0 ? ltv / successfulPayments.length : 0;

        const lastActivityDate = successfulPayments.length > 0
          ? new Date(Math.max(...successfulPayments.map(p => new Date(p.payment_date))))
          : new Date(customer.created_at);

        // Extract primary boat information
        const primaryBoat = (customer.boats || [])[0] || {};
        const boatMake = primaryBoat.make || '';
        const boatModel = primaryBoat.model || '';
        const boatLength = primaryBoat.length || '';
        const boatType = primaryBoat.type || '';
        const marina = primaryBoat.marina || '';
        const dock = primaryBoat.dock || '';
        const slip = primaryBoat.slip || '';

        return {
          ...customer,
          ltv,
          orderCount,
          boatCount,
          totalPaid: ltv,
          pendingAmount,
          avgOrderValue,
          lastActivityDate,
          boatMake,
          boatModel,
          boatLength,
          boatType,
          marina,
          dock,
          slip
        };
      });
    }

    // Initialize column checkboxes
    renderColumnCheckboxes();

    // Apply filters and render
    applyFiltersAndRender();

  } catch (error) {
    console.error('Error loading data table:', error);
    document.getElementById('datatable-body').innerHTML =
      '<tr><td colspan="20" style="text-align: center; padding: 2rem;"><div class="widget-error">Failed to load data table</div></td></tr>';
  }
}

/**
 * Render column checkboxes
 */
function renderColumnCheckboxes() {
  const container = document.getElementById('column-checkboxes');
  container.innerHTML = DATA_TABLE_COLUMNS.map((col, index) => `
    <label class="column-checkbox-label">
      <input type="checkbox"
             class="column-checkbox"
             data-column="${col.key}"
             ${col.visible ? 'checked' : ''}>
      ${col.label}
    </label>
  `).join('');

  // Add event listeners
  container.querySelectorAll('.column-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const column = DATA_TABLE_COLUMNS.find(c => c.key === e.target.getAttribute('data-column'));
      if (column) {
        column.visible = e.target.checked;
        renderDataTable();
      }
    });
  });
}

/**
 * Collect filter values
 */
function collectFilters() {
  dataTableState.filters = {
    dateStart: document.getElementById('filter-date-start').value,
    dateEnd: document.getElementById('filter-date-end').value,
    ltvMin: parseFloat(document.getElementById('filter-ltv-min').value) || null,
    ltvMax: parseFloat(document.getElementById('filter-ltv-max').value) || null,
    ordersMin: parseInt(document.getElementById('filter-orders-min').value) || null,
    hasBoats: document.getElementById('filter-has-boats').value
  };
}

/**
 * Apply filters and search
 */
function applyFiltersAndRender() {
  console.log('🔍 Applying filters, dataTableState.data.length:', dataTableState.data.length);
  let filtered = [...dataTableState.data];

  // Apply search
  if (dataTableState.searchQuery) {
    const query = dataTableState.searchQuery.toLowerCase();
    filtered = filtered.filter(row => {
      return DATA_TABLE_COLUMNS.some(col => {
        const value = row[col.key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }

  // Apply filters
  const f = dataTableState.filters;
  if (f.dateStart) {
    const startDate = new Date(f.dateStart);
    filtered = filtered.filter(row => new Date(row.created_at) >= startDate);
  }
  if (f.dateEnd) {
    const endDate = new Date(f.dateEnd);
    filtered = filtered.filter(row => new Date(row.created_at) <= endDate);
  }
  if (f.ltvMin != null) { // Use != to check for both null AND undefined
    filtered = filtered.filter(row => row.ltv >= f.ltvMin);
  }
  if (f.ltvMax != null) { // Use != to check for both null AND undefined
    filtered = filtered.filter(row => row.ltv <= f.ltvMax);
  }
  if (f.ordersMin != null) { // Use != to check for both null AND undefined
    filtered = filtered.filter(row => row.orderCount >= f.ordersMin);
  }
  if (f.hasBoats === 'yes') {
    filtered = filtered.filter(row => row.boatCount > 0);
  } else if (f.hasBoats === 'no') {
    filtered = filtered.filter(row => row.boatCount === 0);
  }

  dataTableState.filteredData = filtered;
  console.log(`✅ Filtered data: ${filtered.length} rows`);
  renderDataTable();
}

/**
 * Sort data
 */
function sortData(column) {
  if (dataTableState.sortColumn === column) {
    // Toggle direction
    dataTableState.sortDirection = dataTableState.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    dataTableState.sortColumn = column;
    dataTableState.sortDirection = 'asc';
  }

  const col = DATA_TABLE_COLUMNS.find(c => c.key === column);
  const direction = dataTableState.sortDirection === 'asc' ? 1 : -1;

  dataTableState.filteredData.sort((a, b) => {
    let aVal = a[column];
    let bVal = b[column];

    // Handle nulls
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Type-specific comparisons
    if (col.type === 'number' || col.type === 'currency') {
      return (parseFloat(aVal) - parseFloat(bVal)) * direction;
    } else if (col.type === 'date') {
      return (new Date(aVal) - new Date(bVal)) * direction;
    } else {
      return String(aVal).localeCompare(String(bVal)) * direction;
    }
  });

  renderDataTable();
}

/**
 * Render data table
 */
function renderDataTable() {
  console.log('🎨 Rendering data table, filteredData.length:', dataTableState.filteredData.length);
  const visibleColumns = DATA_TABLE_COLUMNS.filter(col => col.visible);

  // Render headers
  const headersRow = document.getElementById('datatable-headers');
  headersRow.innerHTML = visibleColumns.map(col => `
    <th class="datatable-header ${col.sortable ? 'sortable' : ''}"
        ${col.sortable ? `onclick="sortData('${col.key}')"` : ''}
        style="width: ${col.width};">
      ${col.label}
      ${col.sortable && dataTableState.sortColumn === col.key ?
        (dataTableState.sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  `).join('');

  // Pagination
  const start = (dataTableState.currentPage - 1) * dataTableState.rowsPerPage;
  const end = start + dataTableState.rowsPerPage;
  const pageData = dataTableState.filteredData.slice(start, end);

  // Render rows
  const tbody = document.getElementById('datatable-body');
  if (pageData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="20" style="text-align: center; padding: 2rem; color: #7f8c8d;">No customers found</td></tr>';
  } else {
    tbody.innerHTML = pageData.map(row => `
      <tr class="datatable-row" onclick="showCustomerDetail('${row.id}')">
        ${visibleColumns.map(col => `
          <td class="datatable-cell">${formatCellValue(row[col.key], col.type)}</td>
        `).join('')}
      </tr>
    `).join('');
  }

  // Update pagination info
  document.getElementById('showing-count').textContent = pageData.length;
  document.getElementById('total-count').textContent = dataTableState.filteredData.length;

  const totalPages = Math.ceil(dataTableState.filteredData.length / dataTableState.rowsPerPage);
  document.getElementById('page-info').textContent = `Page ${dataTableState.currentPage} of ${totalPages}`;

  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  prevBtn.disabled = dataTableState.currentPage === 1;
  nextBtn.disabled = dataTableState.currentPage >= totalPages;
}

/**
 * Format cell value based on type
 */
function formatCellValue(value, type) {
  if (value == null || value === '') return '-';

  switch (type) {
    case 'currency':
      return formatCurrency(value);
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'number':
      return value.toLocaleString();
    default:
      return value;
  }
}

/**
 * Export to CSV
 */
function exportToCSV() {
  const visibleColumns = DATA_TABLE_COLUMNS.filter(col => col.visible);
  const data = dataTableState.filteredData;

  // Create CSV content
  const headers = visibleColumns.map(col => col.label).join(',');
  const rows = data.map(row => {
    return visibleColumns.map(col => {
      let value = row[col.key];
      if (value == null) return '';

      // Format based on type
      if (col.type === 'date') {
        value = new Date(value).toLocaleDateString();
      } else if (col.type === 'currency') {
        value = value.toFixed(2);
      }

      // Escape commas and quotes
      value = String(value).replace(/"/g, '""');
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value}"`;
      }
      return value;
    }).join(',');
  }).join('\n');

  const csv = `${headers}\n${rows}`;

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export to Excel
 */
function exportToExcel() {
  const visibleColumns = DATA_TABLE_COLUMNS.filter(col => col.visible);
  const data = dataTableState.filteredData;

  // Create worksheet data
  const wsData = [
    visibleColumns.map(col => col.label),
    ...data.map(row => visibleColumns.map(col => {
      let value = row[col.key];
      if (value == null) return '';

      if (col.type === 'date') {
        return new Date(value).toLocaleDateString();
      } else if (col.type === 'currency' || col.type === 'number') {
        return parseFloat(value) || 0;
      }
      return value;
    }))
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = visibleColumns.map(col => ({ wch: 20 }));

  XLSX.utils.book_append_sheet(wb, ws, 'Customers');

  // Download
  XLSX.writeFile(wb, `customers-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Make sortData available globally for onclick handlers
window.sortData = sortData;
