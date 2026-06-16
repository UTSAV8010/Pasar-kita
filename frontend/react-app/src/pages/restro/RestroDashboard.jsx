import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { Plus, Edit, Trash2, Check, X, AlertTriangle } from 'lucide-react';

export default function RestroDashboard() {
  const { user, addAlert } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active section based on sub-route
  const path = location.pathname;
  let activeTab = 'dashboard';
  if (path.includes('/manage-category') || path.includes('/add-category') || path.includes('/update-category')) activeTab = 'categories';
  else if (path.includes('/manage-food') || path.includes('/add-food') || path.includes('/update-food')) activeTab = 'foods';
  else if (path.includes('/inventory') || path.includes('/update-inventory')) activeTab = 'inventory';
  else if (path.includes('/manage-online-order') || path.includes('/update-online-order')) activeTab = 'orders';
  else if (path.includes('/monthly-revenue')) activeTab = 'revenue';
  else if (path.includes('/manage-review')) activeTab = 'reviews';
  else if (path.includes('/manage-repeat-rate')) activeTab = 'repeat-rate';
  else if (path.includes('/settings')) activeTab = 'settings';
  else if (path.includes('/update-password')) activeTab = 'change-password';

  // State managers
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [kpis, setKpis] = useState({ categories: 0, revenue: 0, orders_completed: 0, menu_items: 0 });
  const [salesByDay, setSalesByDay] = useState([]);
  const [mostSold, setMostSold] = useState([]);
  const [allTimeRevenue, setAllTimeRevenue] = useState([]);
  const [allTimeRows, setAllTimeRows] = useState([]);
  const [revenueStats, setRevenueStats] = useState({
    all_time_total: 0.0,
    all_time_orders: 0,
    last12_total: 0.0,
    last12_orders: 0,
    current_month_total: 0.0,
    current_month_orders: 0,
    average_monthly: 0.0,
    current_month_label: ''
  });

  // Data arrays
  const [categoriesList, setCategoriesList] = useState([]);
  const [foodsList, setFoodsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [repeatRatesList, setRepeatRatesList] = useState([]);
  const [overallRepeatRate, setOverallRepeatRate] = useState(0.0);

  // CRUD & Interactive states
  const [currentAction, setCurrentAction] = useState('list'); // 'list', 'add', 'edit'
  const [selectedItem, setSelectedItem] = useState(null); // for editing
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [remainingOnly, setRemainingOnly] = useState(false);

  // Form inputs - Category
  const [catTitle, setCatTitle] = useState('');
  const [catFeatured, setCatFeatured] = useState('No');
  const [catActive, setCatActive] = useState('No');
  const [catImageFile, setCatImageFile] = useState(null);
  const [catImagePreview, setCatImagePreview] = useState('');

  // Form inputs - Food
  const [foodTitle, setFoodTitle] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [foodCategory, setFoodCategory] = useState('');
  const [foodFeatured, setFoodFeatured] = useState('No');
  const [foodActive, setFoodActive] = useState('No');
  const [foodStock, setFoodStock] = useState('0');
  const [foodImageFile, setFoodImageFile] = useState(null);
  const [foodImagePreview, setFoodImagePreview] = useState('');

  // Form inputs - Inventory update
  const [stockEditId, setStockEditId] = useState(null);
  const [stockEditTitle, setStockEditTitle] = useState('');
  const [stockEditQty, setStockEditQty] = useState(0);
  const [orderEditStatus, setOrderEditStatus] = useState('');

  // Settings states
  const [restroName, setRestroName] = useState('');
  const [restroBanner, setRestroBanner] = useState('');
  const [newRestroBannerFile, setNewRestroBannerFile] = useState(null);
  const [newRestroBannerPreview, setNewRestroBannerPreview] = useState('');
  const [restroLicence, setRestroLicence] = useState('');
  const [newRestroLicenceFile, setNewRestroLicenceFile] = useState(null);
  const [newRestroLicencePreview, setNewRestroLicencePreview] = useState('');

  // Password visibility states
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Password validation error states
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [errorCurrentPwd, setErrorCurrentPwd] = useState('');
  const [errorNewPwd, setErrorNewPwd] = useState('');
  const [errorConfirmPwd, setErrorConfirmPwd] = useState('');

  useEffect(() => {
    fetchDataForTab();
  }, [activeTab, lowStockOnly, remainingOnly]);

  // Periodic auto-refresh for Dashboard and Orders tabs (every 30 seconds)
  useEffect(() => {
    let intervalId;
    if (activeTab === 'dashboard' || activeTab === 'orders') {
      intervalId = setInterval(() => {
        fetchDataForTab(true);
      }, 30000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab]);

  // Load Google Charts when on dashboard or revenue tab
  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'revenue') {
      const loadGoogleCharts = () => {
        if (window.google && window.google.charts) {
          drawCharts();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          window.google.charts.load('current', { packages: ['corechart', 'bar'] });
          window.google.charts.setOnLoadCallback(drawCharts);
        };
        document.body.appendChild(script);
      };

      const drawCharts = () => {
        if (!window.google || !window.google.visualization) return;

        const isDark = document.body.classList.contains('dark');
        const themeMutedText = isDark ? '#aabdda' : '#475569';
        const themePanelText = isDark ? '#dbe7ff' : '#1e293b';
        const themeGrid = isDark ? '#2a3f69' : '#dbe3f1';
        // eslint-disable-next-line no-unused-vars
        void themeGrid; // used in chart options below

        // 1. Donut Chart (Dashboard only)
        const msiChartEl = document.getElementById('donutchart_msi');
        if (msiChartEl) {
          const msiData = [['Item Name', 'Sales']];
          mostSold.forEach(item => msiData.push([item.item_name, item.total_qty]));
          if (msiData.length === 1) msiData.push(['No Data', 1]);

          const msiTable = window.google.visualization.arrayToDataTable(msiData);
          const msiOptions = {
            pieHole: 0.68,
            fontName: 'Outfit',
            fontSize: 12,
            backgroundColor: 'transparent',
            chartArea: { left: 18, top: 16, width: '94%', height: '78%' },
            legend: { position: 'bottom', alignment: 'center', textStyle: { color: themeMutedText } },
            colors: ['#2563eb', '#ef4444', '#e69500', '#22c55e', '#8b5cf6']
          };
          const msiChart = new window.google.visualization.PieChart(msiChartEl);
          msiChart.draw(msiTable, msiOptions);
        }

        // 2. Sales Trend Bar Chart (Dashboard only)
        const salesChartEl = document.getElementById('columnchart_material');
        if (salesChartEl) {
          const salesData = [['Day', 'Sales']];
          salesByDay.forEach(day => salesData.push([day.day, day.total_sales]));
          if (salesData.length === 1) salesData.push(['-', 0]);

          const salesTable = window.google.visualization.arrayToDataTable(salesData);
          const salesOptions = {
            backgroundColor: 'transparent',
            legend: { position: 'none' },
            colors: ['#e69500'],
            hAxis: { title: 'Day', textStyle: { color: themeMutedText } },
            vAxis: { title: 'Sales', minValue: 0, textStyle: { color: themeMutedText } }
          };
          const salesChart = new window.google.visualization.ColumnChart(salesChartEl);
          salesChart.draw(salesTable, salesOptions);
        }

        // 3. Monthly Revenue Chart (Dashboard or Revenue tab)
        const monthlyChartEl = document.getElementById('monthly_revenue_chart');
        if (monthlyChartEl) {
          const chartData = [['Month', 'Revenue']];
          allTimeRevenue.forEach(row => chartData.push([row.month || row.label, row.total_revenue || row.total]));
          if (chartData.length === 1) chartData.push(['-', 0]);

          const tableData = window.google.visualization.arrayToDataTable(chartData);
          const isNarrow = window.innerWidth <= 576;
          const options = {
            backgroundColor: 'transparent',
            chartArea: isNarrow
              ? { left: 44, top: 12, width: '90%', height: '72%', backgroundColor: 'transparent' }
              : { left: 64, top: 16, width: '88%', height: '74%', backgroundColor: 'transparent' },
            legend: { position: 'none' },
            colors: ['#f59e0b'],
            bar: { groupWidth: isNarrow ? '42%' : '56%' },
            hAxis: {
              title: isNarrow ? '' : 'Month',
              textStyle: { color: themeMutedText, fontSize: isNarrow ? 9 : 12 },
              titleTextStyle: { color: themePanelText, italic: false },
              slantedText: true,
              slantedTextAngle: isNarrow ? 55 : 35,
              showTextEvery: 1,
              maxAlternation: 1,
              baselineColor: themeGrid,
              gridlines: { color: themeGrid }
            },
            vAxis: {
              title: 'Revenue',
              minValue: 0,
              textStyle: { color: themeMutedText, fontSize: isNarrow ? 10 : 12 },
              titleTextStyle: { color: themePanelText, italic: false },
              baselineColor: themeGrid,
              gridlines: { color: themeGrid }
            }
          };
          const chart = new window.google.visualization.ColumnChart(monthlyChartEl);
          chart.draw(tableData, options);
        }

        // 4. All Time Revenue Chart (Dashboard or Revenue tab)
        const allTimeChartEl = document.getElementById('all_time_revenue_chart');
        if (allTimeChartEl) {
          // On revenue tab, use allTimeRows (all-time data); on dashboard, use allTimeRevenue
          const sourceRows = (activeTab === 'revenue' && allTimeRows.length > 0) ? allTimeRows : allTimeRevenue;
          const chartData = [['Month', 'Revenue']];
          sourceRows.forEach(row => chartData.push([row.month || row.label, row.total_revenue || row.total]));
          if (chartData.length === 1) chartData.push(['-', 0]);

          const tableData = window.google.visualization.arrayToDataTable(chartData);
          const isNarrow = window.innerWidth <= 576;
          const options = {
            backgroundColor: 'transparent',
            chartArea: isNarrow
              ? { left: 44, top: 12, width: '90%', height: '72%', backgroundColor: 'transparent' }
              : { left: 64, top: 16, width: '88%', height: '74%', backgroundColor: 'transparent' },
            legend: { position: 'none' },
            colors: ['#8b5cf6'],
            bar: { groupWidth: isNarrow ? '42%' : '56%' },
            hAxis: {
              title: isNarrow ? '' : 'Month',
              textStyle: { color: themeMutedText, fontSize: isNarrow ? 9 : 12 },
              titleTextStyle: { color: themePanelText, italic: false },
              slantedText: true,
              slantedTextAngle: isNarrow ? 55 : 35,
              showTextEvery: 1,
              maxAlternation: 1,
              baselineColor: themeGrid,
              gridlines: { color: themeGrid }
            },
            vAxis: {
              title: 'Revenue',
              minValue: 0,
              textStyle: { color: themeMutedText, fontSize: isNarrow ? 10 : 12 },
              titleTextStyle: { color: themePanelText, italic: false },
              baselineColor: themeGrid,
              gridlines: { color: themeGrid }
            }
          };
          const chart = new window.google.visualization.ColumnChart(allTimeChartEl);
          chart.draw(tableData, options);
        }
      };

      loadGoogleCharts();

      const handleResize = () => drawCharts();
      const handleThemeChange = () => drawCharts();
      window.addEventListener('resize', handleResize);
      window.addEventListener('admin-theme-change', handleThemeChange);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('admin-theme-change', handleThemeChange);
      };
    }
  }, [activeTab, mostSold, salesByDay, allTimeRevenue]);

  const fetchDataForTab = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setCurrentAction('list');
    }
    try {
      if (activeTab === 'dashboard') {
        const liveData = await apiRequest('/restro/dashboard-live-data');
        if (liveData && liveData.success) {
          setKpis(liveData.kpis);
          setSalesByDay(liveData.sales_by_hour || []);
          setMostSold(liveData.most_sold_items || []);
          setAllTimeRevenue(liveData.all_time_monthly_revenue || []);
        }
      } else if (activeTab === 'categories') {
        const data = await apiRequest('/restro/manage-category');
        if (data && data.categories) {
          setCategoriesList(data.categories);
        }
      } else if (activeTab === 'foods') {
        const data = await apiRequest('/restro/manage-food');
        if (data && data.foods) {
          setFoodsList(data.foods);
        }
        const catData = await apiRequest('/restro/manage-category');
        if (catData && catData.categories) {
          setCategoriesList(catData.categories);
        }
      } else if (activeTab === 'inventory') {
        const data = await apiRequest(`/restro/inventory${lowStockOnly ? '?low=1' : ''}`);
        if (data && data.foods) {
          setFoodsList(data.foods);
        }
      } else if (activeTab === 'orders') {
        const data = await apiRequest(`/restro/manage-online-order${remainingOnly ? '?remaining=1' : ''}`);
        if (data && data.orders) {
          setOrdersList(data.orders);
        }
      } else if (activeTab === 'revenue') {
        const data = await apiRequest('/restro/monthly-revenue');
        if (data) {
          if (data.sorted_month_totals) {
            setAllTimeRevenue(data.sorted_month_totals);
          }
          if (data.all_time_rows) {
            setAllTimeRows(data.all_time_rows);
          }
          setRevenueStats({
            all_time_total: data.all_time_total || 0.0,
            all_time_orders: data.all_time_orders || 0,
            last12_total: data.last12_total || 0.0,
            last12_orders: data.last12_orders || 0,
            current_month_total: data.current_month_total || 0.0,
            current_month_orders: data.current_month_orders || 0,
            average_monthly: data.average_monthly || 0.0,
            current_month_label: data.current_month_label || ''
          });
        }
      } else if (activeTab === 'reviews') {
        const data = await apiRequest('/restro/manage-review');
        if (data && data.reviews) {
          setReviewsList(data.reviews);
        }
      } else if (activeTab === 'repeat-rate') {
        const data = await apiRequest('/restro/manage-repeat-rate');
        if (data) {
          setRepeatRatesList(data.repeat_rates || []);
          setOverallRepeatRate(data.overall_repeat_rate || 0.0);
        }
      } else if (activeTab === 'settings') {
        const data = await apiRequest('/restro/settings');
        if (data) {
          setRestroName(data.current_name || '');
          setRestroBanner(data.current_image || '');
          setNewRestroBannerPreview(data.current_image ? `/${data.current_image}` : '');
          setRestroLicence(data.current_licence_image || '');
          setNewRestroLicencePreview(data.current_licence_image ? `/${data.current_licence_image}` : '');
        }
      }
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const mapInstances = React.useRef({});

  const initMaps = () => {
    if (!window.L || activeTab !== 'orders' || currentAction !== 'list') return;
    ordersList.forEach((order) => {
      const mapId = `map-${order.order_id}`;
      const el = document.getElementById(mapId);
      if (el && !mapInstances.current[mapId] && order.latitude && order.longitude) {
        try {
          const lat = parseFloat(order.latitude);
          const lng = parseFloat(order.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            const map = window.L.map(mapId).setView([lat, lng], 13);
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap'
            }).addTo(map);
            window.L.marker([lat, lng]).addTo(map)
              .bindPopup(`Latitude: ${lat}<br>Longitude: ${lng}`);
            mapInstances.current[mapId] = map;
          }
        } catch (e) {
          console.error("Error creating map:", e);
        }
      }
    });
  };

  const loadLeaflet = () => {
    if (window.L) {
      initMaps();
      return;
    }
    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssLink.id = cssId;
      document.head.appendChild(cssLink);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      initMaps();
    };
    document.body.appendChild(script);
  };

  useEffect(() => {
    if (activeTab === 'orders' && currentAction === 'list' && ordersList.length > 0) {
      loadLeaflet();
    }
    return () => {
      // Cleanup maps
      Object.values(mapInstances.current).forEach((map) => {
        try { map.remove(); } catch (e) {}
      });
      mapInstances.current = {};
    };
  }, [activeTab, currentAction, ordersList]);

  // CATEGORY OPERATIONS
  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catTitle) {
      addAlert('Category Title is required', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('title', catTitle);
      data.append('featured', catFeatured);
      data.append('active', catActive);
      if (catImageFile) {
        data.append('image', catImageFile);
      }

      await apiRequest('/restro/add-category', {
        method: 'POST',
        body: data,
      });

      addAlert('Category request submitted successfully!', 'success');
      resetCatForm();
      fetchDataForTab();
    } catch (err) {
      addAlert('Failed to submit category.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditCategoryLoad = (cat) => {
    setSelectedItem(cat);
    setCatTitle(cat.title || '');
    setCatFeatured(cat.featured || 'No');
    setCatActive(cat.active || 'No');
    setCatImagePreview(cat.image_name ? `/static/uploads/category/${cat.image_name}` : '');
    setCurrentAction('edit');
  };

  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('id', selectedItem.cid);
      data.append('title', catTitle);
      data.append('featured', catFeatured);
      data.append('active', catActive);
      if (catImageFile) {
        data.append('image', catImageFile);
      }

      await apiRequest('/restro/update-category', {
        method: 'POST',
        body: data,
      });

      addAlert('Category details updated, awaiting approval!', 'success');
      resetCatForm();
      fetchDataForTab();
    } catch (err) {
      addAlert('Failed to update category.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await apiRequest(`/restro/delete-category?id=${id}`);
      addAlert('Category deleted successfully.', 'warning');
      fetchDataForTab();
    } catch (err) {
      addAlert('Failed to delete category.', 'danger');
    }
  };

  const resetCatForm = () => {
    setCatTitle('');
    setCatFeatured('No');
    setCatActive('No');
    setCatImageFile(null);
    setCatImagePreview('');
    setSelectedItem(null);
    setCurrentAction('list');
  };

  // FOOD ITEM OPERATIONS
  const handleAddFoodSubmit = async (e) => {
    e.preventDefault();
    if (!foodTitle || !foodCategory || !foodPrice) {
      addAlert('Please fill in title, category, and price.', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('title', foodTitle);
      data.append('description', foodDescription);
      data.append('price', foodPrice);
      data.append('category', foodCategory);
      data.append('featured', foodFeatured);
      data.append('active', foodActive);
      data.append('stock', foodStock);
      if (foodImageFile) {
        data.append('image', foodImageFile);
      }

      await apiRequest('/restro/add-food', {
        method: 'POST',
        body: data,
      });

      addAlert('Food item request submitted successfully!', 'success');
      resetFoodForm();
      fetchDataForTab();
    } catch (err) {
      addAlert('Failed to submit food item.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditFoodLoad = (food) => {
    setSelectedItem(food);
    setFoodTitle(food.title || '');
    setFoodDescription(food.description || '');
    setFoodPrice(String(food.price || ''));
    setFoodCategory(String(food.cid || ''));
    setFoodFeatured(food.featured || 'No');
    setFoodActive(food.active || 'No');
    setFoodStock(String(food.stock || '0'));
    setFoodImagePreview(food.image_name ? `/static/uploads/food/${food.image_name}` : '');
    setCurrentAction('edit');
  };

  const handleEditFoodSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('id', selectedItem.id);
      data.append('title', foodTitle);
      data.append('description', foodDescription);
      data.append('price', foodPrice);
      data.append('category', foodCategory);
      data.append('featured', foodFeatured);
      data.append('active', foodActive);
      data.append('stock', foodStock);
      if (foodImageFile) {
        data.append('image', foodImageFile);
      }

      await apiRequest('/restro/update-food', {
        method: 'POST',
        body: data,
      });

      addAlert('Food item details updated, awaiting approval!', 'success');
      resetFoodForm();
      fetchDataForTab();
    } catch (err) {
      addAlert('Failed to update food item.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      await apiRequest(`/restro/delete-food?id=${id}`);
      addAlert('Food item deleted.', 'warning');
      fetchDataForTab();
    } catch (err) {
      addAlert('Failed to delete food item.', 'danger');
    }
  };

  const resetFoodForm = () => {
    setFoodTitle('');
    setFoodDescription('');
    setFoodPrice('');
    setFoodCategory('');
    setFoodFeatured('No');
    setFoodActive('No');
    setFoodStock('0');
    setFoodImageFile(null);
    setFoodImagePreview('');
    setSelectedItem(null);
    setCurrentAction('list');
  };

  // INVENTORY OPERATIONS
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('id', stockEditId);
      data.append('title', stockEditTitle);
      data.append('stock', String(stockEditQty));

      await apiRequest('/restro/update-inventory', {
        method: 'POST',
        body: data,
      });

      addAlert('Stock inventory updated successfully!', 'success');
      setStockEditId(null);
      fetchDataForTab();
    } catch (err) {
      addAlert('Failed to update stock quantity.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ORDER PROCESSING
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const data = new FormData();
      data.append('id', orderId);
      data.append('order_status', status);

      await apiRequest('/restro/update-online-order', {
        method: 'POST',
        body: data,
      });

      addAlert(`Order status updated to ${status}!`, 'success');
      fetchDataForTab();
    } catch (err) {
      addAlert('Failed to change order status.', 'danger');
    }
  };

  const handleEditOrderLoad = (order) => {
    setSelectedItem(order);
    setOrderEditStatus(order.order_status || '');
    setCurrentAction('edit');
  };

  const handleEditOrderSubmit = async (e) => {
    e.preventDefault();
    if (!orderEditStatus) {
      addAlert('Please select an order status.', 'warning');
      return;
    }
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('id', selectedItem.order_id);
      data.append('order_status', orderEditStatus);

      await apiRequest('/restro/update-online-order', {
        method: 'POST',
        body: data,
      });

      addAlert('Order status updated successfully!', 'success');
      setSelectedItem(null);
      setCurrentAction('list');
      fetchDataForTab();
    } catch (err) {
      addAlert('Failed to update order status.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  // SETTINGS & PASSWORD
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('restro_name', restroName);
      data.append('current_image', restroBanner);
      data.append('current_licence_image', restroLicence);
      if (newRestroBannerFile) {
        data.append('restro_image', newRestroBannerFile);
      }
      if (newRestroLicenceFile) {
        data.append('food_licence_image', newRestroLicenceFile);
      }

      await apiRequest('/restro/settings', {
        method: 'POST',
        body: data,
      });

      addAlert('Restaurant settings updated successfully.', 'success');
      fetchDataForTab();
    } catch (err) {
      addAlert(err.message || 'Failed to update restaurant settings.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    // Reset previous client-side errors
    setErrorCurrentPwd('');
    setErrorNewPwd('');
    setErrorConfirmPwd('');

    let isValid = true;

    if (!currentPwd) {
      setErrorCurrentPwd('Current password is required.');
      isValid = false;
    }

    if (!newPwd) {
      setErrorNewPwd('New password is required.');
      isValid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/.test(newPwd)) {
      setErrorNewPwd('Password strength is insufficient.');
      isValid = false;
    }

    if (!confirmPwd) {
      setErrorConfirmPwd('Confirm password is required.');
      isValid = false;
    } else if (confirmPwd !== newPwd) {
      setErrorConfirmPwd('Confirm password does not match new password.');
      isValid = false;
    }

    if (!isValid) return;

    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('current_password', currentPwd);
      data.append('new_password', newPwd);
      data.append('confirm_password', confirmPwd);

      const response = await apiRequest('/restro/update-password', {
        method: 'POST',
        body: data,
      });

      if (response && response.success_message) {
        addAlert(response.success_message, 'success');
        setCurrentPwd('');
        setNewPwd('');
        setConfirmPwd('');
      } else {
        addAlert('Invalid current password or new password structure.', 'danger');
      }
    } catch (err) {
      addAlert(err.message || 'Password update failed.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ fontFamily: '"Nunito", "Segoe UI", sans-serif' }}>
      <style>{`
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .kpi-card {
            background: var(--bg-card, #ffffff);
            border: 1px solid var(--line, #edf2f9);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
            display: flex;
            align-items: center;
            gap: 15px;
            transition: transform .2s ease;
        }
        .kpi-card:hover {
            transform: translateY(-2px);
        }
        .kpi-card .icon-wrap {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            display: grid;
            place-items: center;
            font-size: 24px;
        }
        .kpi-card.blue .icon-wrap { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
        .kpi-card.yellow .icon-wrap { background: rgba(230, 149, 0, 0.1); color: #e69500; }
        .kpi-card.green .icon-wrap { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        .kpi-card.purple .icon-wrap { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
        
        .kpi-card h3 { margin: 0; font-size: 13px; font-weight: 700; color: var(--text-muted, #61708c); text-transform: uppercase; }
        .kpi-card p { margin: 5px 0 0; font-size: 24px; font-weight: 800; color: var(--text-main, #0f172f); }

        .chart-panel-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        @media (max-width: 992px) {
            .chart-panel-grid {
                grid-template-columns: 1fr;
            }
        }
        .chart-panel {
            background: var(--bg-card, #ffffff);
            border: 1px solid var(--line, #edf2f9);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
            margin-bottom: 20px;
        }
        .chart-panel .panel-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .chart-panel h3 { margin: 0; font-size: 16px; font-weight: 700; color: var(--text-main, #0f172f); }
        .panel-chip {
            font-size: 11px;
            font-weight: 700;
            background: var(--bg-badge, #edf2f9);
            color: var(--text-muted, #61708c);
            padding: 4px 8px;
            border-radius: 20px;
        }
        .chart-body {
            width: 100%;
            min-height: 280px;
        }
        .order-item-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        .order-item-table th, .order-item-table td {
            border: 1px solid var(--line, #edf2f9);
            padding: 6px 8px;
            font-size: 12px;
            text-align: left;
            background: transparent !important;
        }
        .order-item-table th {
            background: var(--bg-badge, #edf2f9) !important;
            color: var(--text-main) !important;
        }
        .map-container {
            border-radius: 8px;
            border: 1px solid var(--line, #edf2f9);
            overflow: hidden;
        }
        form table, form .rtable {
            min-width: 0 !important;
            width: 100% !important;
        }
        form td {
            text-align: left !important;
        }
      `}</style>
      
      {/* Title block */}
      <div className="head-title">
        <div className="left">
          <h1>
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'categories' && 'Category'}
            {activeTab === 'foods' && 'Food Menu'}
            {activeTab === 'inventory' && 'Inventory'}
            {activeTab === 'orders' && 'Online Orders'}
            {activeTab === 'revenue' && 'Monthly Revenue'}
            {activeTab === 'reviews' && 'Your Review'}
            {activeTab === 'repeat-rate' && 'Customer Repeat Rate'}
            {activeTab === 'settings' && 'Settings'}
            {activeTab === 'change-password' && 'Change Password'}
          </h1>
          <ul className="breadcrumb">
            <li><Link to="/restro/">Dashboard</Link></li>
            {activeTab !== 'dashboard' && (
              <>
                <li><i className="bx bx-chevron-right"></i></li>
                <li>
                  <Link className="active" to={location.pathname}>
                    {activeTab === 'categories' && 'Category'}
                    {activeTab === 'foods' && 'Food Menu'}
                    {activeTab === 'inventory' && 'Inventory'}
                    {activeTab === 'orders' && 'Online Orders'}
                    {activeTab === 'revenue' && 'Monthly Revenue'}
                    {activeTab === 'reviews' && 'Your Review'}
                    {activeTab === 'repeat-rate' && 'Repeat Rate'}
                    {activeTab === 'settings' && 'Settings'}
                    {activeTab === 'change-password' && 'Change Password'}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid rgba(230,149,0,0.1)', borderTopColor: '#e69500', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              {/* KPIs */}
              <div className="kpi-grid">
                <div className="kpi-card blue">
                  <div className="icon-wrap"><i className="bx bxs-category"></i></div>
                  <div>
                    <h3>Categories</h3>
                    <p>{kpis.categories}</p>
                  </div>
                </div>

                <div className="kpi-card yellow">
                  <div className="icon-wrap"><i className="bx bx-rupee"></i></div>
                  <div>
                    <h3>Total Sales</h3>
                    <p>Rs {Number(kpis.revenue).toFixed(2)}</p>
                  </div>
                </div>

                <div className="kpi-card green">
                  <div className="icon-wrap"><i className="bx bxs-shopping-bag"></i></div>
                  <div>
                    <h3>Orders Completed</h3>
                    <p>{kpis.orders_completed}</p>
                  </div>
                </div>

                <div className="kpi-card purple">
                  <div className="icon-wrap"><i className="bx bxs-food-menu"></i></div>
                  <div>
                    <h3>Menu Items</h3>
                    <p>{kpis.menu_items}</p>
                  </div>
                </div>
              </div>

              {/* Charts & stats Grid */}
              <div className="chart-panel-grid">
                <div className="chart-panel">
                  <div className="panel-head">
                    <h3>Most Sold Items</h3>
                    <span className="panel-chip">All time</span>
                  </div>
                  <div className="chart-body" id="donutchart_msi"></div>
                </div>

                <div className="chart-panel">
                  <div className="panel-head">
                    <h3>Sales Trend</h3>
                    <span className="panel-chip">Last 7 days</span>
                  </div>
                  <div className="chart-body" id="columnchart_material"></div>
                </div>
              </div>

              <div className="chart-panel-grid">
                <div className="chart-panel">
                  <div className="panel-head">
                    <h3>Monthly Sales Revenue</h3>
                    <span className="panel-chip">Last 12 months</span>
                  </div>
                  <div className="chart-body" id="monthly_revenue_chart"></div>
                </div>

                <div className="chart-panel">
                  <div className="panel-head">
                    <h3>All-Time Revenue By Month</h3>
                    <span className="panel-chip">All time</span>
                  </div>
                  <div className="chart-body" id="all_time_revenue_chart"></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORIES */}
          {activeTab === 'categories' && (
            <div>
              {currentAction === 'list' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <h3>Categories List</h3>
                      <button 
                        onClick={() => setCurrentAction('add')}
                        className="button-8"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <span>Add Category</span>
                      </button>
                    </div>

                    {categoriesList.length === 0 ? (
                      <p style={{ color: '#64748b', textAlign: 'center' }}>No categories found. Click add category to create one.</p>
                    ) : (
                      <div className="orders-table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Banner</th>
                              <th>Title</th>
                              <th>Featured</th>
                              <th>Active</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categoriesList.map((cat) => (
                              <tr key={cat.cid}>
                                <td>
                                  <img 
                                    src={cat.image_name ? `/static/uploads/category/${cat.image_name}` : 'https://placehold.co/80x50'} 
                                    alt={cat.title} 
                                    style={{ width: '60px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                                    onError={(e) => e.target.src = 'https://placehold.co/80x50'}
                                  />
                                </td>
                                <td><strong>{cat.title}</strong></td>
                                <td>{cat.featured}</td>
                                <td>{cat.active}</td>
                                <td>
                                  <span className={`status ${cat.status === 'approved' ? 'completed' : 'pending'}`}>
                                    {cat.status}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                                    <button onClick={() => handleEditCategoryLoad(cat)} className="button-5" style={{ padding: '6px 12px', minHeight: 'auto', fontSize: '12px' }}>Update</button>
                                    <button onClick={() => handleDeleteCategory(cat.cid)} className="button-7" style={{ padding: '6px 12px', minHeight: 'auto', fontSize: '12px' }}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add/Edit Category Form */}
              {(currentAction === 'add' || currentAction === 'edit') && (
                <div className="table-data">
                  <div className="order">
                    <div className="head" style={{ marginBottom: '1.5rem' }}>
                      <h3>{currentAction === 'add' ? 'Add Category' : 'Update Category'}</h3>
                    </div>
 
                    <form onSubmit={currentAction === 'add' ? handleAddCategorySubmit : handleEditCategorySubmit}>
                      <table className="rtable">
                        <tbody>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold', width: '25%' }}>Title</td>
                            <td style={{ textAlign: 'left' }}>
                              <input 
                                type="text" 
                                value={catTitle} 
                                onChange={(e) => setCatTitle(e.target.value)} 
                                id="ip2"
                                placeholder="Category Title"
                                required 
                              />
                            </td>
                          </tr>
                          {currentAction === 'edit' && catImagePreview && (
                            <tr>
                              <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Current Image</td>
                              <td style={{ textAlign: 'left' }}>
                                <img src={catImagePreview} alt="Preview" style={{ maxHeight: '100px', borderRadius: '8px' }} />
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Select Image</td>
                            <td style={{ textAlign: 'left' }}>
                              {currentAction === 'add' && catImagePreview && (
                                <div style={{ marginBottom: '10px' }}>
                                  <img src={catImagePreview} alt="Preview" style={{ maxHeight: '100px', borderRadius: '8px' }} />
                                </div>
                              )}
                              <input 
                                type="file" 
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setCatImageFile(file);
                                    setCatImagePreview(URL.createObjectURL(file));
                                  }
                                }} 
                                accept="image/*"
                                required={currentAction === 'add'} 
                              />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Featured</td>
                            <td style={{ textAlign: 'left' }}>
                              <label style={{ marginRight: '15px', cursor: 'pointer' }}>
                                <input 
                                  type="radio" 
                                  name="featured" 
                                  value="Yes" 
                                  checked={catFeatured === 'Yes'} 
                                  onChange={(e) => setCatFeatured(e.target.value)} 
                                /> Yes
                              </label>
                              <label style={{ cursor: 'pointer' }}>
                                <input 
                                  type="radio" 
                                  name="featured" 
                                  value="No" 
                                  checked={catFeatured === 'No'} 
                                  onChange={(e) => setCatFeatured(e.target.value)} 
                                /> No
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Active</td>
                            <td style={{ textAlign: 'left' }}>
                              <label style={{ marginRight: '15px', cursor: 'pointer' }}>
                                <input 
                                  type="radio" 
                                  name="active" 
                                  value="Yes" 
                                  checked={catActive === 'Yes'} 
                                  onChange={(e) => setCatActive(e.target.value)} 
                                /> Yes
                              </label>
                              <label style={{ cursor: 'pointer' }}>
                                <input 
                                  type="radio" 
                                  name="active" 
                                  value="No" 
                                  checked={catActive === 'No'} 
                                  onChange={(e) => setCatActive(e.target.value)} 
                                /> No
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="2" style={{ textAlign: 'left', padding: '1.5rem 0 0 0' }}>
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" disabled={submitLoading} className="button-8" style={{ minWidth: '150px' }}>
                                  {submitLoading ? 'Saving...' : (currentAction === 'add' ? 'Add Category' : 'Update Category')}
                                </button>
                                <button type="button" onClick={resetCatForm} className="button-5" style={{ background: '#64748b' }}>
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FOOD MENU */}
          {activeTab === 'foods' && (
            <div>
              {currentAction === 'list' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <h3>Kitchen Food Menu</h3>
                      <button 
                        onClick={() => setCurrentAction('add')}
                        className="button-8"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <span>Add Food Item</span>
                      </button>
                    </div>

                    {foodsList.length === 0 ? (
                      <p style={{ color: '#64748b', textAlign: 'center' }}>No food items added yet. Click add food item to construct your menu.</p>
                    ) : (
                      <div className="orders-table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Food Image</th>
                              <th>Title</th>
                              <th>Price</th>
                              <th>Featured</th>
                              <th>Active</th>
                              <th>Stock</th>
                              <th>Approval</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {foodsList.map((food) => (
                              <tr key={food.id}>
                                <td>
                                  <img 
                                    src={food.image_name ? `/static/uploads/food/${food.image_name}` : 'https://placehold.co/80x50'} 
                                    alt={food.title} 
                                    style={{ width: '60px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                                    onError={(e) => e.target.src = 'https://placehold.co/80x50'}
                                  />
                                </td>
                                <td><strong>{food.title}</strong></td>
                                <td><strong>Rs {food.price}</strong></td>
                                <td>{food.featured}</td>
                                <td>{food.active}</td>
                                <td>
                                  <span className={`status ${food.stock <= 3 ? 'cancelled' : 'completed'}`} style={{ textTransform: 'none' }}>
                                    {food.stock} in stock
                                  </span>
                                </td>
                                <td>
                                  <span className={`status ${food.status === 'approved' ? 'completed' : 'pending'}`}>
                                    {food.status}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                                    <button onClick={() => handleEditFoodLoad(food)} className="button-8" style={{ padding: '6px 12px', minHeight: 'auto', fontSize: '12px' }}>Update</button>
                                    <button onClick={() => handleDeleteFood(food.id)} className="button-7" style={{ padding: '6px 12px', minHeight: 'auto', fontSize: '12px' }}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add/Edit Food Form */}
              {(currentAction === 'add' || currentAction === 'edit') && (
                <div className="table-data">
                  <div className="order">
                    <div className="head" style={{ marginBottom: '1.5rem' }}>
                      <h3>{currentAction === 'add' ? 'Add Food' : 'Update Food'}</h3>
                    </div>

                    <form onSubmit={currentAction === 'add' ? handleAddFoodSubmit : handleEditFoodSubmit}>
                      <table className="rtable">
                        <tbody>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold', width: '25%' }}>Title</td>
                            <td style={{ textAlign: 'left' }}>
                              <input 
                                type="text" 
                                value={foodTitle} 
                                onChange={(e) => setFoodTitle(e.target.value)} 
                                id="title"
                                placeholder="e.g. Cheesy Garlic Pizza"
                                required 
                              />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Description</td>
                            <td style={{ textAlign: 'left' }}>
                              <textarea 
                                value={foodDescription} 
                                onChange={(e) => setFoodDescription(e.target.value)} 
                                id="description"
                                placeholder="Describe flavors, toppings, or size..."
                                cols="24"
                                rows="5"
                                required
                              />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Price (Rs)</td>
                            <td style={{ textAlign: 'left' }}>
                              <input 
                                type="number" 
                                step="0.01" 
                                value={foodPrice} 
                                onChange={(e) => setFoodPrice(e.target.value)} 
                                id="price"
                                required 
                              />
                            </td>
                          </tr>
                          {currentAction === 'edit' && foodImagePreview && (
                            <tr>
                              <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Current Image</td>
                              <td style={{ textAlign: 'left' }}>
                                <img src={foodImagePreview} alt="Preview" style={{ maxHeight: '100px', borderRadius: '8px' }} />
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Select Image</td>
                            <td style={{ textAlign: 'left' }}>
                              {currentAction === 'add' && foodImagePreview && (
                                <div style={{ marginBottom: '10px' }}>
                                  <img src={foodImagePreview} alt="Preview" style={{ maxHeight: '100px', borderRadius: '8px' }} />
                                </div>
                              )}
                              <input 
                                type="file" 
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setFoodImageFile(file);
                                    setFoodImagePreview(URL.createObjectURL(file));
                                  }
                                }} 
                                id="image"
                                accept="image/*"
                                required={currentAction === 'add'} 
                              />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Category</td>
                            <td style={{ textAlign: 'left' }}>
                              <select value={foodCategory} onChange={(e) => setFoodCategory(e.target.value)} id="category" required>
                                <option value="">Select Category</option>
                                {categoriesList.map(cat => (
                                  <option key={cat.cid} value={cat.cid}>{cat.title}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Featured</td>
                            <td style={{ textAlign: 'left' }}>
                              <label style={{ marginRight: '15px', cursor: 'pointer' }}>
                                <input 
                                  type="radio" 
                                  name="featured" 
                                  value="Yes" 
                                  checked={foodFeatured === 'Yes'} 
                                  onChange={(e) => setFoodFeatured(e.target.value)} 
                                /> Yes
                              </label>
                              <label style={{ cursor: 'pointer' }}>
                                <input 
                                  type="radio" 
                                  name="featured" 
                                  value="No" 
                                  checked={foodFeatured === 'No'} 
                                  onChange={(e) => setFoodFeatured(e.target.value)} 
                                /> No
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Stock</td>
                            <td style={{ textAlign: 'left' }}>
                              <input 
                                type="number" 
                                value={foodStock} 
                                onChange={(e) => setFoodStock(e.target.value)} 
                                id="stock"
                                min="0"
                                required 
                              />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Active</td>
                            <td style={{ textAlign: 'left' }}>
                              <label style={{ marginRight: '15px', cursor: 'pointer' }}>
                                <input 
                                  type="radio" 
                                  name="active" 
                                  value="Yes" 
                                  checked={foodActive === 'Yes'} 
                                  onChange={(e) => setFoodActive(e.target.value)} 
                                /> Yes
                              </label>
                              <label style={{ cursor: 'pointer' }}>
                                <input 
                                  type="radio" 
                                  name="active" 
                                  value="No" 
                                  checked={foodActive === 'No'} 
                                  onChange={(e) => setFoodActive(e.target.value)} 
                                /> No
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="2" style={{ textAlign: 'left', padding: '1.5rem 0 0 0' }}>
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" disabled={submitLoading} className="button-8" style={{ minWidth: '150px' }}>
                                  {submitLoading ? 'Saving...' : (currentAction === 'add' ? 'Add Food' : 'Update Food')}
                                </button>
                                <button type="button" onClick={resetFoodForm} className="button-5" style={{ background: '#64748b' }}>
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INVENTORY STOCK MANAGER */}
          {activeTab === 'inventory' && (
            <div>
              {currentAction === 'list' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <h3>Food Item Stocks</h3>
                      {lowStockOnly ? (
                        <button 
                          onClick={() => setLowStockOnly(false)} 
                          className="button-8"
                        >
                          View All Items
                        </button>
                      ) : (
                        <button 
                          onClick={() => setLowStockOnly(true)} 
                          className="button-7"
                        >
                          View Low Stock Only
                        </button>
                      )}
                    </div>

                    {foodsList.length === 0 ? (
                      <p style={{ color: '#64748b', textAlign: 'center' }}>No Food Items Available</p>
                    ) : (
                      <div className="orders-table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Item Name</th>
                              <th>Image</th>
                              <th>Available Stocks</th>
                              <th>Stock Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {foodsList.map((food) => (
                              <tr key={food.id}>
                                <td><strong>{food.title}</strong></td>
                                <td>
                                  <img 
                                    src={food.image_name ? `/static/uploads/food/${food.image_name}` : 'https://placehold.co/80x50'} 
                                    alt={food.title} 
                                    style={{ width: '60px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                                    onError={(e) => e.target.src = 'https://placehold.co/80x50'}
                                  />
                                </td>
                                <td><strong>{food.stock}</strong></td>
                                <td>
                                  {food.stock <= 3 ? (
                                    <span className="status pending">Low Stock ({food.stock})</span>
                                  ) : (
                                    <span className="status completed">In Stock ({food.stock})</span>
                                  )}
                                </td>
                                <td>
                                  <button 
                                    onClick={() => {
                                      setStockEditId(food.id);
                                      setStockEditTitle(food.title);
                                      setStockEditQty(food.stock);
                                      setCurrentAction('edit');
                                    }} 
                                    className="button-5"
                                    style={{ padding: '6px 12px', minHeight: 'auto', fontSize: '0.85rem' }}
                                  >
                                    Update Stock
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentAction === 'edit' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head" style={{ marginBottom: '1.5rem' }}>
                      <h3>Update Inventory</h3>
                    </div>

                    <form onSubmit={handleUpdateStock}>
                      <table className="rtable">
                        <tbody>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold', width: '25%' }}>Item Name</td>
                            <td style={{ textAlign: 'left' }}>
                              <input 
                                type="text" 
                                value={stockEditTitle} 
                                onChange={(e) => setStockEditTitle(e.target.value)} 
                                id="title"
                                required 
                              />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Stocks</td>
                            <td style={{ textAlign: 'left' }}>
                              <input 
                                type="number" 
                                value={stockEditQty} 
                                onChange={(e) => setStockEditQty(e.target.value)} 
                                id="stock"
                                min="0"
                                required 
                              />
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="2" style={{ textAlign: 'left', padding: '1.5rem 0 0 0' }}>
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" disabled={submitLoading} className="button-8" style={{ minWidth: '150px' }}>
                                  {submitLoading ? 'Updating...' : 'Update Stock'}
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setStockEditId(null);
                                    setCurrentAction('list');
                                  }} 
                                  className="button-5" 
                                  style={{ background: '#64748b' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ONLINE ORDERS */}
          {activeTab === 'orders' && (
            <div>
              {currentAction === 'list' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <h3>Recent Orders</h3>
                      <div className="filter-actions">
                        {remainingOnly ? (
                          <button onClick={() => setRemainingOnly(false)} className="button-8">
                            View All Orders
                          </button>
                        ) : (
                          <button onClick={() => setRemainingOnly(true)} className="button-7">
                            View Pending/Processing Only
                          </button>
                        )}
                      </div>
                    </div>

                    {ordersList.length === 0 ? (
                      <p style={{ color: '#64748b', textAlign: 'center' }}>No orders found.</p>
                    ) : (
                      <div className="orders-table-wrap">
                        <table className="orders-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Customer Name</th>
                              <th>Address</th>
                              <th>Phone</th>
                              <th>Location Map</th>
                              <th>Delivery Boy</th>
                              <th>Payment Status</th>
                              <th>Order Status</th>
                              <th>Your Subtotal</th>
                              <th>Items</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ordersList.map((order) => (
                              <tr key={order.order_id}>
                                <td>{order.order_id}</td>
                                <td>{order.cus_name}</td>
                                <td>{order.cus_add1}</td>
                                <td>{order.cus_phone}</td>
                                <td>
                                  {order.latitude && order.longitude ? (
                                    <div 
                                      className="map-container" 
                                      id={`map-${order.order_id}`} 
                                      style={{ height: '150px', width: '250px' }}
                                    />
                                  ) : (
                                    <span className="text-muted">Location not available</span>
                                  )}
                                </td>
                                <td>
                                  {order.delivery_boy_name ? (
                                    order.delivery_boy_name
                                  ) : (
                                    <span className="text-muted" style={{ fontSize: '11px' }}>Not assigned</span>
                                  )}
                                </td>
                                <td>
                                  <span className={`status ${
                                    order.payment_status === 'successful' || order.payment_status === 'upi' ? 'completed' :
                                    order.payment_status === 'Refunded' ? 'pending' :
                                    order.payment_status === 'cod' ? 'process' : 'cancelled'
                                  }`}>
                                    {order.payment_status}
                                  </span>
                                </td>
                                <td>
                                  <span className={`status ${
                                    order.order_status === 'Pending' ? 'process' :
                                    order.order_status === 'Processing' ? 'pending' :
                                    order.order_status === 'Delivered' || order.order_status === 'OnTheWay' ? 'completed' : 'cancelled'
                                  }`}>
                                    {order.order_status}
                                  </span>
                                  {order.order_status !== 'Delivered' && order.order_status !== 'Cancelled' && (
                                    <>
                                      <br /><br />
                                      <button 
                                        onClick={() => handleEditOrderLoad(order)} 
                                        className="button-8" 
                                        style={{ padding: '4px 8px', fontSize: '11px', minHeight: 'auto' }}
                                      >
                                        Update
                                      </button>
                                    </>
                                  )}
                                </td>
                                <td>Rs {Number(order.restro_subtotal).toFixed(2)}</td>
                                <td>
                                  <table className="order-item-table" style={{ width: '100%', minWidth: 'auto' }}>
                                    <thead>
                                      <tr>
                                        <th>Item Name</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.items?.map((item, idx) => (
                                        <tr key={idx}>
                                          <td>{item.Item_Name}</td>
                                          <td>Rs {item.Price}</td>
                                          <td>{item.Quantity}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentAction === 'edit' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head" style={{ marginBottom: '1.5rem' }}>
                      <h3>Update Online Order</h3>
                    </div>

                    <form onSubmit={handleEditOrderSubmit}>
                      <table className="rtable">
                        <tbody>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold', width: '25%' }}>Customer Name</td>
                            <td style={{ textAlign: 'left' }}>
                              <input type="text" value={selectedItem?.cus_name || ''} id="ip2" readOnly />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Email</td>
                            <td style={{ textAlign: 'left' }}>
                              <input type="text" value={selectedItem?.cus_email || ''} id="ip2" readOnly />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Address</td>
                            <td style={{ textAlign: 'left' }}>
                              <input type="text" value={selectedItem?.cus_add1 || ''} id="ip2" readOnly />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Phone</td>
                            <td style={{ textAlign: 'left' }}>
                              <input type="text" value={selectedItem?.cus_phone || ''} id="ip2" readOnly />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>Order Status</td>
                            <td style={{ textAlign: 'left' }}>
                              <select 
                                value={orderEditStatus} 
                                onChange={(e) => setOrderEditStatus(e.target.value)} 
                                id="order_status"
                                required
                              >
                                <option value="">Select Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="2" style={{ textAlign: 'left', padding: '1.5rem 0 0 0' }}>
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" disabled={submitLoading} className="button-8" style={{ minWidth: '150px' }}>
                                  {submitLoading ? 'Updating...' : 'Update'}
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setSelectedItem(null);
                                    setCurrentAction('list');
                                  }} 
                                  className="button-5" 
                                  style={{ background: '#64748b' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MONTHLY REVENUE */}
          {activeTab === 'revenue' && (
            <div>
              <style>{`
                .summary-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                  gap: 16px;
                  margin-bottom: 18px;
                }
                .summary-card {
                  background: var(--bg-card, #ffffff);
                  border: 1px solid var(--line, #edf2f9);
                  border-radius: 12px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                  padding: 16px;
                }
                .summary-card h3 {
                  margin: 0;
                  font-size: 13px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.04em;
                  color: var(--text-muted, #61708c);
                }
                .summary-card p {
                  margin: 10px 0 4px;
                  font-size: 28px;
                  font-weight: 800;
                  color: var(--text-main, #0f172f);
                }
                .summary-card small {
                  color: var(--text-muted, #61708c);
                }
                .revenue-chart-panel {
                  background: var(--bg-card, #ffffff);
                  border: 1px solid var(--line, #edf2f9);
                  border-radius: 12px;
                  padding: 20px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                  margin-bottom: 18px;
                }
                .revenue-chart-panel .panel-head {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 15px;
                }
                .revenue-chart-panel h3 { margin: 0; font-size: 16px; font-weight: 700; color: var(--text-main, #0f172f); }
                .revenue-chart { width: 100% !important; min-height: 360px; }
                @media (max-width: 768px) { .revenue-chart { min-height: 300px; } }
                @media (max-width: 576px) { .revenue-chart { min-height: 260px; } }
              `}</style>

              {/* 4 Summary Cards */}
              <div className="summary-grid">
                <div className="summary-card">
                  <h3>Total Revenue (All time)</h3>
                  <p>Rs {Number(revenueStats.all_time_total).toFixed(2)}</p>
                  <small>{revenueStats.all_time_orders} total orders</small>
                </div>
                <div className="summary-card">
                  <h3>Last 12 Months</h3>
                  <p>Rs {Number(revenueStats.last12_total).toFixed(2)}</p>
                  <small>{revenueStats.last12_orders} total orders</small>
                </div>
                <div className="summary-card">
                  <h3>This Month ({revenueStats.current_month_label})</h3>
                  <p>Rs {Number(revenueStats.current_month_total).toFixed(2)}</p>
                  <small>{revenueStats.current_month_orders} orders</small>
                </div>
                <div className="summary-card">
                  <h3>Average / Month</h3>
                  <p>Rs {Number(revenueStats.average_monthly).toFixed(2)}</p>
                  <small>Based on last 12 months</small>
                </div>
              </div>

              {/* Monthly Revenue Chart */}
              <div className="revenue-chart-panel">
                <div className="panel-head">
                  <h3>Monthly Revenue</h3>
                  <span className="panel-chip">Last 12 months</span>
                </div>
                <div className="chart revenue-chart" id="monthly_revenue_chart" />
              </div>

              {/* All-Time Revenue Chart */}
              <div className="revenue-chart-panel">
                <div className="panel-head">
                  <h3>Total Revenue By Month</h3>
                  <span className="panel-chip">All time</span>
                </div>
                <div className="chart revenue-chart" id="all_time_revenue_chart" />
              </div>

              {/* Month Totals Table */}
              <div className="table-data">
                <div className="order">
                  <div className="orders-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Total Revenue</th>
                          <th>Orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allTimeRevenue.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="error text-center">No revenue records found.</td>
                          </tr>
                        ) : (
                          allTimeRevenue.map((rev, idx) => (
                            <tr key={idx}>
                              <td>{rev.label}</td>
                              <td>Rs {Number(rev.total).toFixed(2)}</td>
                              <td>{rev.orders}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CUSTOMER REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="table-data">
              <div className="order">
                <div className="orders-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Restaurant Name</th>
                        <th>Review Message</th>
                        <th>Rating</th>
                        <th>Customer Name</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewsList.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="error text-center">No reviews submitted yet.</td>
                        </tr>
                      ) : (
                        reviewsList.map((rev, idx) => (
                          <tr key={rev.id || idx}>
                            <td>{idx + 1}.</td>
                            <td>{rev.restro_name}</td>
                            <td>{rev.description || rev.review_message}</td>
                            <td style={{ color: '#ffb325', fontSize: '18px' }}>
                              {'★'.repeat(rev.rating_star || rev.stars || 0)}
                            </td>
                            <td>{rev.customer_name || rev.username}</td>
                            <td>{rev.created_at ? new Date(rev.created_at).toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7.5: REPEAT RATE */}
          {activeTab === 'repeat-rate' && (
            <div className="table-data">
              <div className="order">
                <div className="head" style={{ marginBottom: '1.5rem' }}>
                  <h3>Customer Repeat Rate</h3>
                </div>

                {repeatRatesList.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center' }}>No completed orders found.</p>
                ) : (
                  <>
                    <div className="orders-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Sr No</th>
                            <th>Customer Name</th>
                            <th>Order Count</th>
                            <th>Repeat Rate (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {repeatRatesList.map((row, idx) => (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td><strong>{row.username}</strong></td>
                              <td>{row.count}</td>
                              <td><strong style={{ color: 'var(--primary)' }}>{row.rate}%</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--line)' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        Total Customer Repeat Rate: <span style={{ color: 'var(--primary)' }}>{overallRepeatRate}%</span>
                      </h2>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: STORE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="table-data">
              <div className="order" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="head" style={{ marginBottom: '1.5rem' }}>
                  <h3>Profile Settings</h3>
                </div>

                <form onSubmit={handleUpdateSettings} className="settings-grid" style={{ display: 'grid', gap: '14px' }}>
                  <div>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Restaurant Name</label>
                    <input 
                      type="text" 
                      value={restroName} 
                      onChange={(e) => setRestroName(e.target.value)} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }}
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Current Image</label>
                    {newRestroBannerPreview ? (
                      <img 
                        src={newRestroBannerPreview} 
                        alt="Restaurant Image" 
                        className="profile-preview" 
                        style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--line)', display: 'block' }} 
                        onError={(e) => { e.target.src = 'https://placehold.co/120'; }}
                      />
                    ) : (
                      <p style={{ color: 'red', fontWeight: 'bold' }}>No image available.</p>
                    )}
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Change Image</label>
                    <input 
                      type="file" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setNewRestroBannerFile(file);
                          setNewRestroBannerPreview(URL.createObjectURL(file));
                        }
                      }} 
                      accept="image/*" 
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Current Food Licence Image</label>
                    {newRestroLicencePreview ? (
                      <img 
                        src={newRestroLicencePreview} 
                        alt="Food Licence Image" 
                        className="profile-preview" 
                        style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--line)', display: 'block' }} 
                        onError={(e) => { e.target.src = 'https://placehold.co/120'; }}
                      />
                    ) : (
                      <p style={{ color: 'red', fontWeight: 'bold' }}>No food licence image available.</p>
                    )}
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Change Food Licence Image</label>
                    <input 
                      type="file" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setNewRestroLicenceFile(file);
                          setNewRestroLicencePreview(URL.createObjectURL(file));
                        }
                      }} 
                      accept="image/*" 
                    />
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <button type="submit" disabled={submitLoading} className="button-8">
                      {submitLoading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 9: CHANGE PASSWORD */}
          {activeTab === 'change-password' && (
            <div className="table-data">
              <style>{`
                .password-field { position: relative; width: 100%; }
                .password-field input { padding-right: 44px !important; }
                .password-toggle {
                    position: absolute;
                    top: 50%;
                    right: 10px;
                    transform: translateY(-50%);
                    width: 34px;
                    height: 34px;
                    border: 0;
                    padding: 0;
                    margin: 0;
                    background: transparent;
                    color: #61708c;
                    display: grid;
                    place-items: center;
                    cursor: pointer;
                }
                .password-toggle svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
                .password-toggle.is-visible { color: #e69500; }
                .error-msg { color: red; font-size: 13px; margin-top: 4px; display: block; }
              `}</style>
              <div className="order" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="head" style={{ marginBottom: '1.5rem' }}>
                  <h3>Update Restaurant Password</h3>
                </div>

                <form onSubmit={handleUpdatePassword}>
                  <table className="rtable" style={{ width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '10px 0', fontWeight: 'bold', width: '30%' }}>Current Password</td>
                        <td style={{ padding: '10px 0' }}>
                          <div className="password-field">
                            <input 
                              type={showCurrentPwd ? 'text' : 'password'} 
                              value={currentPwd} 
                              onChange={(e) => setCurrentPwd(e.target.value)} 
                              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }}
                              required 
                            />
                            <button 
                              type="button" 
                              className={`password-toggle ${showCurrentPwd ? 'is-visible' : ''}`}
                              onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                            >
                              {showCurrentPwd ? (
                                <svg className="eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M3 5l18 14"></path>
                                    <path d="M10.7 10.8a3 3 0 004.2 4.2"></path>
                                    <path d="M6.2 7.4C4 9.1 2.5 12 2.5 12s3.5 6 9.5 6c2.1 0 3.9-.6 5.4-1.6"></path>
                                    <path d="M13.3 6.2A9.6 9.6 0 0012 6c-2.1 0-3.9.6-5.5 1.6"></path>
                                </svg>
                              ) : (
                                <svg className="eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"></path>
                                    <circle cx="12" cy="12" r="3.2"></circle>
                                </svg>
                              )}
                            </button>
                          </div>
                          {errorCurrentPwd && <span className="error-msg">{errorCurrentPwd}</span>}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px 0', fontWeight: 'bold' }}>New Password</td>
                        <td style={{ padding: '10px 0' }}>
                          <div className="password-field">
                            <input 
                              type={showNewPwd ? 'text' : 'password'} 
                              value={newPwd} 
                              onChange={(e) => setNewPwd(e.target.value)} 
                              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }}
                              required 
                            />
                            <button 
                              type="button" 
                              className={`password-toggle ${showNewPwd ? 'is-visible' : ''}`}
                              onClick={() => setShowNewPwd(!showNewPwd)}
                            >
                              {showNewPwd ? (
                                <svg className="eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M3 5l18 14"></path>
                                    <path d="M10.7 10.8a3 3 0 004.2 4.2"></path>
                                    <path d="M6.2 7.4C4 9.1 2.5 12 2.5 12s3.5 6 9.5 6c2.1 0 3.9-.6 5.4-1.6"></path>
                                    <path d="M13.3 6.2A9.6 9.6 0 0012 6c-2.1 0-3.9.6-5.5 1.6"></path>
                                </svg>
                              ) : (
                                <svg className="eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"></path>
                                    <circle cx="12" cy="12" r="3.2"></circle>
                                </svg>
                              )}
                            </button>
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7892', marginTop: '4px' }}>8+ characters, including upper & lower case, numbers, and special symbols.</div>
                          {errorNewPwd && <span className="error-msg">{errorNewPwd}</span>}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Confirm Password</td>
                        <td style={{ padding: '10px 0' }}>
                          <div className="password-field">
                            <input 
                              type={showConfirmPwd ? 'text' : 'password'} 
                              value={confirmPwd} 
                              onChange={(e) => setConfirmPwd(e.target.value)} 
                              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }}
                              required 
                            />
                            <button 
                              type="button" 
                              className={`password-toggle ${showConfirmPwd ? 'is-visible' : ''}`}
                              onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                            >
                              {showConfirmPwd ? (
                                <svg className="eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M3 5l18 14"></path>
                                    <path d="M10.7 10.8a3 3 0 004.2 4.2"></path>
                                    <path d="M6.2 7.4C4 9.1 2.5 12 2.5 12s3.5 6 9.5 6c2.1 0 3.9-.6 5.4-1.6"></path>
                                    <path d="M13.3 6.2A9.6 9.6 0 0012 6c-2.1 0-3.9.6-5.5 1.6"></path>
                                </svg>
                              ) : (
                                <svg className="eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"></path>
                                    <circle cx="12" cy="12" r="3.2"></circle>
                                </svg>
                              )}
                            </button>
                          </div>
                          {errorConfirmPwd && <span className="error-msg">{errorConfirmPwd}</span>}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="2" style={{ padding: '15px 0 0' }}>
                          <button type="submit" disabled={submitLoading} className="button-8">
                            {submitLoading ? 'Changing Password...' : 'Change Password'}
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
