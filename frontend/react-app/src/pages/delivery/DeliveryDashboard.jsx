import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';

export default function DeliveryDashboard() {
  const { user, addAlert } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab mapping based on current URL path
  const path = location.pathname;
  let activeTab = 'dashboard';
  if (path.includes('/manage-online-order')) activeTab = 'orders';
  else if (path.includes('/manage-delivery-payment')) activeTab = 'earnings';
  else if (path.includes('/monthly-revenue')) activeTab = 'revenue';
  else if (path.includes('/manage-review')) activeTab = 'reviews';
  else if (path.includes('/settings')) activeTab = 'settings';
  else if (path.includes('/update-password')) activeTab = 'password';

  // Global states
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Dashboard KPI metrics & Chart data
  const [kpis, setKpis] = useState({
    categories: 0.0, // Total tips
    revenue: 0.0,    // Monthly salary
    orders_completed: 0, // Remaining orders
    menu_items: 0,   // Delivered by me
  });
  const [donutChartData, setDonutChartData] = useState([]);
  const [dailyChartData, setDailyChartData] = useState([]);
  const [monthlyChartData, setMonthlyChartData] = useState([]);

  // Online Orders state
  const [orders, setOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);

  // Payment History state
  const [payments, setPayments] = useState([]);

  // Monthly Revenue stats
  const [revenueStats, setRevenueStats] = useState({
    sorted_month_totals: [],
    current_month_label: '',
    current_month_total: 0.0,
    current_month_payments: 0,
    last12_total: 0.0,
    last12_payments: 0,
    average_monthly: 0.0,
  });

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  // Profile Settings state
  const [profileName, setProfileName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [newProfileImageFile, setNewProfileImageFile] = useState(null);

  // Password fields state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // Fetch data on tab or search params changes
  useEffect(() => {
    fetchTabData();
  }, [activeTab, location.search]);

  const fetchTabData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(location.search);

      if (activeTab === 'dashboard') {
        const liveData = await apiRequest('/delivery-boy/dashboard-live-data');
        if (liveData && liveData.success) {
          setKpis(liveData.kpis);

          // Format Donut chart
          const soldRows = [['Item Name', 'Sales']];
          if (liveData.most_sold_items && liveData.most_sold_items.length > 0) {
            liveData.most_sold_items.forEach(row => {
              soldRows.push([row.item_name || 'Unknown', Number(row.total_qty || 0)]);
            });
          } else {
            soldRows.push(['No Data', 1]);
          }
          setDonutChartData(soldRows);

          // Format Daily chart
          const dailyRows = [['Day', 'Sales']];
          if (liveData.sales_by_hour && liveData.sales_by_hour.length > 0) {
            liveData.sales_by_hour.forEach(row => {
              dailyRows.push([row.day || '', Number(row.total_sales || 0)]);
            });
          } else {
            dailyRows.push(['-', 0]);
          }
          setDailyChartData(dailyRows);

          // Format Monthly chart
          const monthlyRows = [['Month', 'Revenue']];
          if (liveData.monthly_revenue && liveData.monthly_revenue.length > 0) {
            liveData.monthly_revenue.forEach(row => {
              monthlyRows.push([row.month || '', Number(row.total_revenue || 0)]);
            });
          } else {
            monthlyRows.push(['-', 0]);
          }
          setMonthlyChartData(monthlyRows);
        }
      } 
      else if (activeTab === 'orders') {
        const remaining = queryParams.get('remaining') === '1';
        const mine = queryParams.get('mine') === '1';
        const status = queryParams.get('status') || '';
        const page = Number(queryParams.get('page') || 1);

        const data = await apiRequest(
          `/delivery-boy/manage-online-order?page=${page}&status=${status}&mine=${mine ? 1 : 0}&remaining=${remaining ? 1 : 0}`
        );
        if (data && data.orders) {
          setOrders(data.orders);
          setOrdersPage(data.page || page);
          setOrdersTotalPages(data.total_pages || 1);
        }
      } 
      else if (activeTab === 'earnings') {
        const data = await apiRequest('/delivery-boy/manage-delivery-payment');
        if (data && data.payments) {
          setPayments(data.payments);
        }
      } 
      else if (activeTab === 'revenue') {
        const data = await apiRequest('/delivery-boy/monthly-revenue');
        if (data) {
          setRevenueStats({
            sorted_month_totals: data.sorted_month_totals || [],
            current_month_label: data.current_month_label || '',
            current_month_total: Number(data.current_month_total || 0),
            current_month_payments: data.current_month_payments || 0,
            last12_total: Number(data.last12_total || 0),
            last12_payments: data.last12_payments || 0,
            average_monthly: Number(data.average_monthly || 0),
          });
          setMonthlyChartData(JSON.parse(data.monthly_chart_json || '[]'));
        }
      } 
      else if (activeTab === 'reviews') {
        const data = await apiRequest('/delivery-boy/manage-review');
        if (data && data.reviews) {
          setReviews(data.reviews);
          setAvgRating(data.average_rating || 0);
        }
      } 
      else if (activeTab === 'settings') {
        const data = await apiRequest('/delivery-boy/settings');
        if (data) {
          setProfileName(data.current_name || '');
          setProfileImage(data.current_image || '');
        }
      }
    } catch (err) {
      console.error('Failed to load tab data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Google Charts drawing logic
  useEffect(() => {
    if ((activeTab === 'dashboard' || activeTab === 'revenue') && (donutChartData.length > 0 || dailyChartData.length > 0 || monthlyChartData.length > 0)) {
      const loadGoogleCharts = () => {
        if (window.google && window.google.charts) {
          drawAllCharts();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          window.google.charts.load('current', { packages: ['corechart', 'bar'] });
          window.google.charts.setOnLoadCallback(drawAllCharts);
        };
        document.body.appendChild(script);
      };

      const drawAllCharts = () => {
        if (!window.google || !window.google.visualization) return;

        const isDark = document.body.classList.contains('dark');
        const themeMutedText = isDark ? '#aabdda' : '#475569';
        const themePanelText = isDark ? '#dbe7ff' : '#1e293b';
        const themeGrid = isDark ? '#2a3f69' : '#dbe3f1';
        const themeDonutCenter = isDark ? '#101a33' : '#ffffff';

        const isNarrow = window.innerWidth <= 576;

        // Donut Chart: Deliveries status
        const donutEl = document.getElementById('donutchart_msi');
        if (donutEl && donutChartData.length > 0) {
          const tableData = window.google.visualization.arrayToDataTable(donutChartData);
          const options = {
            pieHole: 0.68,
            pieSliceText: isNarrow ? 'none' : 'percentage',
            fontName: 'Outfit',
            fontSize: 12,
            pieSliceTextStyle: { color: '#ffffff', fontSize: isNarrow ? 10 : 12 },
            chartArea: isNarrow ? { left: 8, top: 8, width: '100%', height: '82%' } : { left: 18, top: 16, width: '94%', height: '78%' },
            legend: isNarrow ? { position: 'none' } : { position: 'bottom', alignment: 'center', textStyle: { color: themeMutedText, fontSize: 12 } },
            backgroundColor: 'transparent',
            pieSliceBorderColor: themeDonutCenter,
            pieStartAngle: -90,
            colors: ['#2563eb', '#ef4444', '#e69500', '#22c55e', '#8b5cf6']
          };
          const chart = new window.google.visualization.PieChart(donutEl);
          chart.draw(tableData, options);
        }

        // Daily Bar Chart: Earnings per day
        const dailyEl = document.getElementById('columnchart_material');
        if (dailyEl && dailyChartData.length > 0) {
          const tableData = window.google.visualization.arrayToDataTable(dailyChartData);
          const options = {
            backgroundColor: 'transparent',
            chartArea: isNarrow ? { left: 40, top: 10, width: '90%', height: '72%' } : { left: 58, top: 14, width: '88%', height: '76%' },
            legend: { position: 'none' },
            colors: ['#e69500'],
            bar: { groupWidth: isNarrow ? '48%' : '56%' },
            hAxis: {
              textStyle: { color: themeMutedText, fontSize: isNarrow ? 10 : 12 },
              baselineColor: themeGrid,
              gridlines: { color: themeGrid }
            },
            vAxis: {
              minValue: 0,
              textStyle: { color: themeMutedText, fontSize: isNarrow ? 10 : 12 },
              baselineColor: themeGrid,
              gridlines: { color: themeGrid }
            }
          };
          const chart = new window.google.visualization.ColumnChart(dailyEl);
          chart.draw(tableData, options);
        }

        // Monthly Revenue Chart: Trend
        const monthlyEl = document.getElementById('monthly_revenue_chart');
        if (monthlyEl && monthlyChartData.length > 0) {
          const displayData = monthlyChartData.map((row, index) => {
            if (index === 0 || !isNarrow) return row;
            const label = String(row[0] ?? '-');
            const shortLabel = label.split(' ')[0];
            return [shortLabel, row[1]];
          });
          const tableData = window.google.visualization.arrayToDataTable(displayData);
          const options = {
            backgroundColor: 'transparent',
            chartArea: isNarrow ? { left: 44, top: 12, width: '90%', height: '72%' } : { left: 64, top: 16, width: '88%', height: '74%' },
            legend: { position: 'none' },
            colors: ['#f59e0b'],
            bar: { groupWidth: isNarrow ? '42%' : '56%' },
            hAxis: {
              textStyle: { color: themeMutedText, fontSize: isNarrow ? 9 : 12 },
              slantedText: true,
              slantedTextAngle: isNarrow ? 55 : 35,
              baselineColor: themeGrid,
              gridlines: { color: themeGrid }
            },
            vAxis: {
              minValue: 0,
              textStyle: { color: themeMutedText, fontSize: isNarrow ? 10 : 12 },
              baselineColor: themeGrid,
              gridlines: { color: themeGrid }
            }
          };
          const chart = new window.google.visualization.ColumnChart(monthlyEl);
          chart.draw(tableData, options);
        }
      };

      loadGoogleCharts();

      const handleResize = () => drawAllCharts();
      window.addEventListener('resize', handleResize);
      window.addEventListener('admin-theme-change', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('admin-theme-change', handleResize);
      };
    }
  }, [activeTab, donutChartData, dailyChartData, monthlyChartData]);

  // Leaflet Maps loading and initialization logic
  useEffect(() => {
    if (activeTab === 'orders' && orders.length > 0) {
      const initLeaflet = () => {
        if (!window.L) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.id = 'leaflet-css';
          document.head.appendChild(link);

          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.id = 'leaflet-js';
          script.onload = () => setupMaps();
          document.body.appendChild(script);
        } else {
          setupMaps();
        }
      };

      const setupMaps = () => {
        orders.forEach(order => {
          const mapId = `map-${order.order_id}`;
          const el = document.getElementById(mapId);
          if (!el || el.dataset.mapLoaded === '1') return;

          const loc = order.location || '';
          if (loc && loc.includes(',')) {
            const parts = loc.split(',');
            const lat = parseFloat(parts[0].trim());
            const lng = parseFloat(parts[1].trim());

            if (!isNaN(lat) && !isNaN(lng)) {
              try {
                const map = window.L.map(mapId).setView([lat, lng], 13);
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  maxZoom: 19,
                  attribution: '&copy; OpenStreetMap'
                }).addTo(map);
                window.L.marker([lat, lng]).addTo(map).bindPopup(`Order #${order.order_id}`);
                el.dataset.mapLoaded = '1';
              } catch (err) {
                console.error(`Leaflet render error for order #${order.order_id}:`, err);
              }
            }
          }
        });
      };

      initLeaflet();
    }
  }, [activeTab, orders]);

  // Pagination helper
  const handleOrdersPageChange = (newPage) => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('page', String(newPage));
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  // Actions: Take order
  const handleTakeOrder = async (orderId) => {
    setSubmitLoading(true);
    try {
      const res = await apiRequest(`/delivery-boy/take-order?id=${orderId}`);
      if (res && res.success) {
        addAlert(res.message || 'Order taken successfully!', 'success');
        fetchTabData();
      } else {
        addAlert(res.message || 'Failed to take order.', 'danger');
      }
    } catch (err) {
      addAlert(err.message || 'Failed to take order.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Actions: Complete delivery
  const handleFinishOrder = async (orderId) => {
    setSubmitLoading(true);
    try {
      const res = await apiRequest(`/delivery-boy/finish-order?id=${orderId}`);
      if (res && res.success) {
        addAlert(res.message || 'Order delivered successfully!', 'success');
        fetchTabData();
      } else {
        addAlert(res.message || 'Failed to complete order.', 'danger');
      }
    } catch (err) {
      addAlert(err.message || 'Failed to complete order.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Profile update form handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileName) {
      addAlert('Name is required.', 'warning');
      return;
    }
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('name', profileName);
      data.append('current_image', profileImage);
      if (newProfileImageFile) {
        data.append('profile_image', newProfileImageFile);
      }

      const res = await apiRequest('/delivery-boy/settings', {
        method: 'POST',
        body: data,
      });

      if (res) {
        addAlert('Profile updated successfully!', 'success');
        setNewProfileImageFile(null);
        fetchTabData();
      }
    } catch (err) {
      addAlert('Failed to update settings.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Password update form handler
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPwd || !newPwd || !confirmPwd) {
      addAlert('All fields are required.', 'warning');
      return;
    }
    if (newPwd !== confirmPwd) {
      addAlert('New passwords do not match.', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('current_password', currentPwd);
      data.append('new_password', newPwd);
      data.append('confirm_password', confirmPwd);

      const res = await apiRequest('/delivery-boy/update-password', {
        method: 'POST',
        body: data,
      });

      if (res) {
        if (res.success_message) {
          addAlert(res.success_message, 'success');
          setCurrentPwd('');
          setNewPwd('');
          setConfirmPwd('');
        } else {
          const errMsg = res.current_password_err || res.new_password_err || res.confirm_password_err || 'Password change failed.';
          addAlert(errMsg, 'danger');
        }
      }
    } catch (err) {
      addAlert('Failed to update password.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Compute Page Titles for Breadcrumbs
  const getPageTitle = () => {
    if (activeTab === 'dashboard') return 'Dashboard';
    if (activeTab === 'orders') {
      const queryParams = new URLSearchParams(location.search);
      if (queryParams.get('remaining') === '1') return 'Delivery Remaining Orders';
      if (queryParams.get('status') === 'Delivered') return 'Completed Orders';
      return 'Online Orders';
    }
    if (activeTab === 'earnings') return 'Payment Information';
    if (activeTab === 'revenue') return 'Monthly Revenue';
    if (activeTab === 'reviews') return 'Review Information';
    if (activeTab === 'settings') return 'Settings';
    if (activeTab === 'password') return 'Change Password';
    return 'Delivery Boy Portal';
  };

  return (
    <div>
      <style>{`
        /* Local style overrides to ensure identical design with PHP panel */
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 18px;
        }
        .summary-card {
            background: var(--bg-card);
            border: 1px solid var(--line);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-soft);
            padding: 16px;
        }
        .summary-card h3 {
            margin: 0;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--text-muted);
        }
        .summary-card p {
            margin: 10px 0 4px;
            font-size: 28px;
            font-weight: 800;
            color: var(--text-main);
        }
        .summary-card small {
            color: var(--text-muted);
        }
        .revenue-chart {
            width: 100% !important;
            min-height: 360px;
        }
        a.clickable {
            color: gray !important;
            pointer-events: auto !important;
            text-decoration: none !important;
        }
        a.clickable:hover {
            color: #007bff !important;
        }
        .orders-table-wrap {
            overflow-x: auto;
        }
        .orders-table {
            min-width: 1150px;
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
        }
        .orders-table th {
            background: #f1f5fb;
            color: #1e293b;
            text-align: left;
            vertical-align: top;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            padding: 12px 10px;
            border-bottom: 1px solid var(--line);
        }
        .orders-table td {
            background: #fff;
            border-bottom: 1px solid var(--line);
            padding: 12px 10px;
            text-align: left;
            vertical-align: top;
            line-height: 1.55;
            font-size: 16px;
            color: #0f172a;
            word-break: normal;
            overflow-wrap: anywhere;
        }
        body.dark .orders-table th {
            background: #1a2946;
            color: #e3ecff;
            border-bottom-color: #2a3f69;
        }
        body.dark .orders-table td {
            background: #0f1a31;
            color: #dfe9ff;
            border-bottom-color: #2a3f69;
        }
        .profile-preview {
            width: 120px;
            height: 120px;
            border-radius: 12px;
            object-fit: cover;
            border: 1px solid var(--line);
        }
        .settings-grid {
            display: grid;
            gap: 14px;
        }
        .filter-tabs {
            display: flex;
            gap: 10px;
            margin: 10px 0 20px;
            flex-wrap: wrap;
            align-items: center;
        }
        .filter-tab {
            padding: 8px 16px;
            border-radius: var(--radius-md);
            background: var(--bg-card);
            border: 1px solid var(--line);
            color: var(--text-main);
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s ease;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .filter-tab:hover {
            background: var(--bg-soft);
            transform: translateY(-1px);
        }
        .filter-tab.active {
            background: linear-gradient(135deg, var(--primary), #f5aa11);
            border-color: #d18700;
            color: #fff;
        }
      `}</style>
      {/* Page Title & Breadcrumb */}
      <div className="head-title">
        <div className="left">
          <h1>{getPageTitle()}</h1>
          <ul className="breadcrumb">
            <li>
              <Link to="/delivery-boy/" className="clickable">Dashboard</Link>
            </li>
            <li><i className="bx bx-chevron-right"></i></li>
            <li>
              <span className="active" style={{ color: 'var(--blue)', fontWeight: 600 }}>{getPageTitle()}</span>
            </li>
          </ul>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid rgba(230,149,0,0.1)', borderTopColor: '#e69500', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <>
              <div className="dashboard-grid">
                <Link to="/delivery-boy/manage-review" className="kpi-card kpi-card-blue">
                  <div className="kpi-media">
                    <img src="/static/images/inventory.png" alt="Tips" />
                    <span className="kpi-badge">Live</span>
                  </div>
                  <div className="kpi-meta">
                    <h3 className="kpi-value">Rs {Number(kpis.categories || 0).toFixed(2)}</h3>
                    <p className="kpi-label">Total Tips</p>
                  </div>
                </Link>

                <Link to="/delivery-boy/monthly-revenue" className="kpi-card kpi-card-gold">
                  <div className="kpi-media">
                    <img src="/static/images/revenue.png" alt="Revenue" />
                    <span className="kpi-badge">Live</span>
                  </div>
                  <div className="kpi-meta">
                    <h3 className="kpi-value">Rs {Number(kpis.revenue || 0).toFixed(2)}</h3>
                    <p className="kpi-label">Monthly Revenue</p>
                  </div>
                </Link>

                <Link to="/delivery-boy/manage-online-order?remaining=1" className="kpi-card kpi-card-violet">
                  <div className="kpi-media">
                    <img src="/static/images/orders_completed.png" alt="Remaining" />
                    <span className="kpi-badge">Live</span>
                  </div>
                  <div className="kpi-meta">
                    <h3 className="kpi-value">{kpis.orders_completed}</h3>
                    <p className="kpi-label">Delivery Remaining Orders</p>
                  </div>
                </Link>

                <Link to="/delivery-boy/manage-online-order?status=Delivered&mine=1" className="kpi-card kpi-card-red">
                  <div className="kpi-media">
                    <img src="/static/images/folder2.png" alt="Delivered" />
                    <span className="kpi-badge">Live</span>
                  </div>
                  <div className="kpi-meta">
                    <h3 className="kpi-value">{kpis.menu_items}</h3>
                    <p className="kpi-label">Order Delivered By You</p>
                  </div>
                </Link>
              </div>

              <div className="dashboard-charts">
                <div className="chart-panel">
                  <div className="panel-head">
                    <h3>Deliveries By Status</h3>
                    <span className="panel-chip">Live Data</span>
                  </div>
                  <div className="chart" id="donutchart_msi"></div>
                </div>

                <div className="chart-panel">
                  <div className="panel-head">
                    <h3>Earnings By Day</h3>
                    <span className="panel-chip" id="sales-chip">Last 7 days</span>
                  </div>
                  <div className="chart" id="columnchart_material"></div>
                </div>

                <div className="chart-panel chart-panel-wide">
                  <div className="panel-head">
                    <h3>Monthly Revenue</h3>
                    <span className="panel-chip" id="monthly-chip">Last 12 months</span>
                  </div>
                  <div className="chart" id="monthly_revenue_chart"></div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ONLINE ORDERS VIEW */}
          {activeTab === 'orders' && (
            <div>
              {/* Status and ownership quick filter shortcuts */}
              <div className="filter-tabs">
                <Link to="/delivery-boy/manage-online-order" className={`filter-tab ${!location.search ? 'active' : ''}`}>
                  All Orders Pool
                </Link>
                <Link to="/delivery-boy/manage-online-order?mine=1&remaining=1" className={`filter-tab ${location.search.includes('mine=1') && location.search.includes('remaining=1') ? 'active' : ''}`}>
                  My Active Tasks
                </Link>
                <Link to="/delivery-boy/manage-online-order?remaining=1" className={`filter-tab ${location.search.includes('remaining=1') && !location.search.includes('mine=1') ? 'active' : ''}`}>
                  Remaining Pool
                </Link>
                <Link to="/delivery-boy/manage-online-order?status=Delivered&mine=1" className={`filter-tab ${location.search.includes('status=Delivered') ? 'active' : ''}`}>
                  My Completed
                </Link>
                <Link to="/delivery-boy/manage-online-order?status=Cancelled&mine=1" className={`filter-tab ${location.search.includes('status=Cancelled') ? 'active' : ''}`}>
                  My Cancelled
                </Link>
              </div>

              <div className="table-data">
                <div className="order">
                  <div className="orders-table-wrap">
                    <table className="orders-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Name</th>
                          <th>Address</th>
                          <th>Phone</th>
                          <th>Location</th>
                          <th>Payment Status</th>
                          <th>Order Status</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length === 0 ? (
                          <tr><td colSpan="9">No orders found.</td></tr>
                        ) : (
                          orders.map((order) => {
                            const dbn = order.delivery_boy_name || '';
                            const os = order.order_status || '';

                            let actionEl = 'No action';
                            if (os === 'Cancelled' || os === 'Delivered' || os === 'Pending') {
                              actionEl = 'No action';
                            } else if (dbn && dbn !== user.username) {
                              actionEl = `Delivery is already taken by ${dbn}.`;
                            } else if (!dbn) {
                              actionEl = (
                                <button 
                                  onClick={() => handleTakeOrder(order.order_id)} 
                                  disabled={submitLoading} 
                                  className="button-8"
                                  style={{ minHeight: '34px', padding: '6px 12px' }}
                                >
                                  Take Order
                                </button>
                              );
                            } else if (os === 'OnTheWay' && dbn === user.username) {
                              actionEl = (
                                <button 
                                  onClick={() => handleFinishOrder(order.order_id)} 
                                  disabled={submitLoading} 
                                  className="button-8"
                                  style={{ minHeight: '34px', padding: '6px 12px' }}
                                >
                                  Finish Delivery
                                </button>
                              );
                            }

                            return (
                              <tr key={order.order_id}>
                                <td>#{order.order_id}</td>
                                <td>{order.cus_name}</td>
                                <td>{order.cus_add1}</td>
                                <td>
                                  <a href={`tel:${order.cus_phone}`} style={{ color: '#007bff' }}>
                                    {order.cus_phone}
                                  </a>
                                </td>
                                <td>
                                  {order.location && order.location.includes(',') ? (
                                    <div id={`map-${order.order_id}`} className="order-map" style={{ width: '250px', height: '150px', border: '1px solid var(--line)', borderRadius: '10px' }}></div>
                                  ) : (
                                    'Location not available.'
                                  )}
                                </td>
                                <td>
                                  <span className={`status ${order.payment_status === 'successful' || order.payment_status === 'upi' ? 'completed' : order.payment_status === 'cod' ? 'process' : 'pending'}`}>
                                    {order.payment_status}
                                  </span>
                                </td>
                                <td>
                                  <span className={`status ${os === 'Pending' || os === 'Processing' ? 'process' : os === 'OnTheWay' || os === 'Delivered' ? 'completed' : 'cancelled'}`}>
                                    {os}
                                  </span>
                                </td>
                                <td>Rs {order.total_amount}</td>
                                <td>{actionEl}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {ordersTotalPages > 1 && (
                    <div className="orders-pagination-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                      <div className="table-pagination ajax-pagination">
                        <button 
                          type="button" 
                          className="page-btn" 
                          disabled={ordersPage <= 1} 
                          onClick={() => handleOrdersPageChange(ordersPage - 1)}
                        >
                          Prev
                        </button>
                        {Array.from({ length: ordersTotalPages }, (_, i) => i + 1)
                          .filter(p => p >= ordersPage - 2 && p <= ordersPage + 2)
                          .map(p => (
                            <button 
                              key={p} 
                              type="button" 
                              className={`page-btn ${p === ordersPage ? 'active' : ''}`} 
                              onClick={() => handleOrdersPageChange(p)}
                            >
                              {p}
                            </button>
                          ))
                        }
                        <button 
                          type="button" 
                          className="page-btn" 
                          disabled={ordersPage >= ordersTotalPages} 
                          onClick={() => handleOrdersPageChange(ordersPage + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT HISTORY VIEW */}
          {activeTab === 'earnings' && (
            <div className="table-data">
              <div className="order">
                <table>
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Order Id</th>
                      <th>Name</th>
                      <th>Salary</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr><td colSpan="5" className="error">No Payments Available</td></tr>
                    ) : (
                      payments.map((pay, idx) => (
                        <tr key={pay.id}>
                          <td>{idx + 1}.</td>
                          <td>#{pay.order_id}</td>
                          <td>{pay.username}</td>
                          <td>Rs {pay.salary}</td>
                          <td>
                            <span className={`status ${pay.payment_status === 'paid' ? 'completed' : 'process'}`}>
                              {pay.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MONTHLY REVENUE VIEW */}
          {activeTab === 'revenue' && (
            <>
              <div className="summary-grid">
                <div className="summary-card">
                  <h3>This Month ({revenueStats.current_month_label})</h3>
                  <p>Rs {revenueStats.current_month_total.toFixed(2)}</p>
                  <small>{revenueStats.current_month_payments} payments</small>
                </div>
                <div className="summary-card">
                  <h3>Last 12 Months</h3>
                  <p>Rs {revenueStats.last12_total.toFixed(2)}</p>
                  <small>{revenueStats.last12_payments} total payments</small>
                </div>
                <div className="summary-card">
                  <h3>Average / Month</h3>
                  <p>Rs {revenueStats.average_monthly.toFixed(2)}</p>
                  <small>Based on last 12 months</small>
                </div>
              </div>

              <div className="chart-panel">
                <div className="panel-head">
                  <h3>Monthly Revenue</h3>
                  <span className="panel-chip" id="monthly-chip">Last 12 months</span>
                </div>
                <div className="chart revenue-chart" id="monthly_revenue_chart"></div>
              </div>

              <div className="table-data">
                <div className="order">
                  <table>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Total Revenue</th>
                        <th>Payments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueStats.sorted_month_totals.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.label}</td>
                          <td>Rs {parseFloat(row.total || 0).toFixed(2)}</td>
                          <td>{row.payments}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 5: REVIEWS VIEW */}
          {activeTab === 'reviews' && (
            <>
              <div className="table-data">
                <div className="order">
                  <table>
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Order Id</th>
                        <th>Delivery Boy Name</th>
                        <th>Review Message</th>
                        <th>Rating</th>
                        <th>Tip</th>
                        <th>Customer Name</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.length === 0 ? (
                        <tr><td colSpan="8" className="error">No Reviews Available</td></tr>
                      ) : (
                        reviews.map((rev, idx) => (
                          <tr key={rev.id}>
                            <td>{idx + 1}.</td>
                            <td>#{rev.order_id}</td>
                            <td>{rev.name}</td>
                            <td>{rev.review_message || rev.message}</td>
                            <td style={{ color: '#fea116', fontSize: '1.1rem' }}>
                              {Array.from({ length: 5 }, (_, i) => (
                                <span key={i}>{i < (rev.review_star || 0) ? '★' : '☆'}</span>
                              ))}
                            </td>
                            <td>Rs {rev.tip || 0}</td>
                            <td>{rev.username}</td>
                            <td>{new Date(rev.created_at).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <h2>Overall Rating: {avgRating} / 5</h2>
                <p style={{ fontSize: '28px', color: '#fea116', margin: '8px 0' }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i}>{i < Math.round(avgRating) ? '★' : '☆'}</span>
                  ))}
                </p>
              </div>
            </>
          )}

          {/* TAB 6: SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <div className="table-data">
              <div className="order">
                <div className="head">
                  <h3>Profile Settings</h3>
                </div>

                <form onSubmit={handleUpdateProfile} className="settings-grid" style={{ display: 'grid', gap: '14px', maxWidth: '600px' }}>
                  <input type="hidden" name="current_image" value={profileImage} />

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Name</label>
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Delivery Boy Aadhaar Image</label><br />
                    {profileImage ? (
                      <img 
                        src={`/static/delivery/${profileImage}`} 
                        alt="Profile Aadhaar Preview" 
                        className="profile-preview"
                        style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--line)' }}
                        onError={(e) => e.target.src = '/static/' + profileImage}
                      />
                    ) : (
                      <p className="error">No image available.</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Change Aadhaar Image</label>
                    <input 
                      type="file" 
                      onChange={(e) => setNewProfileImageFile(e.target.files[0])} 
                      accept="image/*" 
                    />
                  </div>

                  <div>
                    <button type="submit" disabled={submitLoading} className="button-8">
                      {submitLoading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: CHANGE PASSWORD VIEW */}
          {activeTab === 'password' && (
            <div className="table-data">
              <div className="order">
                <div className="head">
                  <h3>Configure Credentials</h3>
                </div>
                <form onSubmit={handleUpdatePassword}>
                  <table className="tbl-30">
                    <tbody>
                      <tr>
                        <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Current Password</td>
                        <td>
                          <input 
                            type="password" 
                            value={currentPwd} 
                            onChange={(e) => setCurrentPwd(e.target.value)} 
                            placeholder="Enter current password"
                            required
                          />
                        </td>
                      </tr>

                      <tr>
                        <td style={{ textAlign: 'left', fontWeight: 'bold' }}>New Password</td>
                        <td>
                          <input 
                            type="password" 
                            value={newPwd} 
                            onChange={(e) => setNewPwd(e.target.value)} 
                            placeholder="Enter new password"
                            required
                          />
                        </td>
                      </tr>

                      <tr>
                        <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Confirm Password</td>
                        <td>
                          <input 
                            type="password" 
                            value={confirmPwd} 
                            onChange={(e) => setConfirmPwd(e.target.value)} 
                            placeholder="Confirm new password"
                            required
                          />
                        </td>
                      </tr>

                      <tr>
                        <td colSpan="2">
                          <button type="submit" disabled={submitLoading} className="button-8">
                            {submitLoading ? 'Updating...' : 'Change Password'}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
