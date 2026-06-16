import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { 
  Shield, FolderTree, UtensilsCrossed, Warehouse, ShoppingCart, TableProperties,
  Landmark, Bike, Gift, BarChart3, Star, Mail, LogOut, Plus, Edit, Trash2, 
  Check, X, AlertTriangle, Users, MessageSquare, ClipboardList, Filter,
  Eye, DollarSign, Upload, Layers, Utensils, Coins, Tag, RefreshCcw
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, addAlert } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab mapping based on path
  const path = location.pathname;
  let activeTab = 'dashboard';
  if (path.includes('/manage-admin')) activeTab = 'admins';
  else if (path.includes('/manage-category')) activeTab = 'categories';
  else if (path.includes('/manage-food')) activeTab = 'foods';
  else if (path.includes('/inventory')) activeTab = 'inventory';
  else if (path.includes('/manage-online-order')) activeTab = 'orders';
  else if (path.includes('/manage-ei-order')) activeTab = 'users';
  else if (path.includes('/manage-restro-category')) activeTab = 'restro_categories';
  else if (path.includes('/manage-restro-food')) activeTab = 'restro_foods';
  else if (path.includes('/manage-restro-review')) activeTab = 'reviews';
  else if (path.includes('/manage-restro')) activeTab = 'restaurants';
  else if (path.includes('/manage-delivery-payment')) activeTab = 'rider_payments';
  else if (path.includes('/manage-delivery-boy')) activeTab = 'riders';
  else if (path.includes('/manage-coupons')) activeTab = 'coupons';
  else if (path.includes('/manage-fest-coupon')) activeTab = 'fest_coupons';
  else if (path.includes('/manage-repeat-rate')) activeTab = 'repeat_rates';
  else if (path.includes('/monthly-revenue')) activeTab = 'revenue';
  else if (path.includes('/manage-review')) activeTab = 'reviews';
  else if (path.includes('/messages')) activeTab = 'messages';

  // Global state managers
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [kpis, setKpis] = useState({ categories: 0, revenue: 0, orders_completed: 0, menu_items: 0 });
  const [salesByDay, setSalesByDay] = useState([]);
  const [mostSold, setMostSold] = useState([]);

  // Data Arrays
  const [adminsList, setAdminsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [foodsList, setFoodsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [ridersList, setRidersList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [revenueList, setRevenueList] = useState([]);
  const [reviewsList, setReviewsList] = useState({ order: [], kitchen: [] });
  const [messagesList, setMessagesList] = useState([]);

  // New tabs list states
  const [restroCategoriesList, setRestroCategoriesList] = useState([]);
  const [restroFoodsList, setRestroFoodsList] = useState([]);
  const [riderPaymentsList, setRiderPaymentsList] = useState([]);
  const [festCouponsList, setFestCouponsList] = useState([]);
  const [repeatRatesList, setRepeatRatesList] = useState([]);
  const [totalRepeatRate, setTotalRepeatRate] = useState(0.0);
  
  // Monthly revenue stats
  const [allTimeTotal, setAllTimeTotal] = useState(0.0);
  const [allTimeOrders, setAllTimeOrders] = useState(0);
  const [last12Total, setLast12Total] = useState(0.0);
  const [last12Orders, setLast12Orders] = useState(0);
  const [averageMonthly, setAverageMonthly] = useState(0.0);

  // Review tab segment toggle state
  const [reviewType, setReviewType] = useState('order'); // 'order' or 'kitchen'

  // Active section CRUD operations
  const [currentAction, setCurrentAction] = useState('list'); // 'list', 'add', 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Input states - Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [couponActive, setCouponActive] = useState('Yes');

  // Input states - Category
  const [catTitle, setCatTitle] = useState('');
  const [catFeatured, setCatFeatured] = useState('No');
  const [catActive, setCatActive] = useState('No');
  const [catImageFile, setCatImageFile] = useState(null);
  const [catImagePreview, setCatImagePreview] = useState('');

  // Input states - Food Item
  const [foodTitle, setFoodTitle] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [foodCategory, setFoodCategory] = useState('');
  const [foodFeatured, setFoodFeatured] = useState('No');
  const [foodActive, setFoodActive] = useState('No');
  const [foodStock, setFoodStock] = useState('0');
  const [foodImageFile, setFoodImageFile] = useState(null);
  const [foodImagePreview, setFoodImagePreview] = useState('');

  // Input states - Sub Admin Add
  const [adminName, setAdminName] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPwd, setAdminPwd] = useState('');

  // Input states - Festival Coupon
  const [festName, setFestName] = useState('');
  const [festCode, setFestCode] = useState('');
  const [festDiscount, setFestDiscount] = useState('');
  const [festDuration, setFestDuration] = useState('7');
  const [festStatus, setFestStatus] = useState('active');
  const [festExpire, setFestExpire] = useState('active');

  // Stock edit inline
  const [stockEditId, setStockEditId] = useState(null);
  const [stockEditQty, setStockEditQty] = useState(0);

  // Dispatch Order variables
  const [dispatchOrderId, setDispatchOrderId] = useState(null);
  const [dispatchRiderName, setDispatchRiderName] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState('');
  const [dispatchPaymentStatus, setDispatchPaymentStatus] = useState('');

  // Load section data dynamically
  useEffect(() => {
    if (path.includes('/manage-restro-review')) {
      setReviewType('kitchen');
    } else if (path.includes('/manage-review')) {
      setReviewType('order');
    }
    fetchTabContent();
  }, [activeTab, lowStockOnly, path]);

  // Google Charts rendering
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

        if (activeTab === 'dashboard') {
          // Donut Chart
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
          const msiChartEl = document.getElementById('donutchart_msi');
          if (msiChartEl) {
            const msiChart = new window.google.visualization.PieChart(msiChartEl);
            msiChart.draw(msiTable, msiOptions);
          }

          // Sales Bar Chart
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
          const salesChartEl = document.getElementById('columnchart_material');
          if (salesChartEl) {
            const salesChart = new window.google.visualization.ColumnChart(salesChartEl);
            salesChart.draw(salesTable, salesOptions);
          }
        } else if (activeTab === 'revenue') {
          // Monthly Revenue Chart
          const monthlyChartEl = document.getElementById('monthly_revenue_chart');
          if (monthlyChartEl) {
            const chartData = [['Month', 'Revenue']];
            revenueList.forEach(row => chartData.push([row.label || row.month, row.total || row.total_revenue]));
            if (chartData.length === 1) chartData.push(['-', 0]);

            const tableData = window.google.visualization.arrayToDataTable(chartData);
            const options = {
              backgroundColor: 'transparent',
              chartArea: { left: 64, top: 16, width: '88%', height: '74%', backgroundColor: 'transparent' },
              legend: { position: 'none' },
              colors: ['#f59e0b'],
              bar: { groupWidth: '56%' },
              hAxis: {
                title: 'Month',
                textStyle: { color: themeMutedText, fontSize: 12 },
                titleTextStyle: { color: themePanelText, italic: false },
                slantedText: true,
                slantedTextAngle: 35,
                baselineColor: themeGrid,
                gridlines: { color: themeGrid }
              },
              vAxis: {
                title: 'Revenue',
                minValue: 0,
                textStyle: { color: themeMutedText, fontSize: 12 },
                titleTextStyle: { color: themePanelText, italic: false },
                baselineColor: themeGrid,
                gridlines: { color: themeGrid }
              }
            };
            const chart = new window.google.visualization.ColumnChart(monthlyChartEl);
            chart.draw(tableData, options);
          }

          // All Time Revenue Chart
          const allTimeChartEl = document.getElementById('all_time_revenue_chart');
          if (allTimeChartEl) {
            const chartData = [['Month', 'Revenue']];
            revenueList.forEach(row => chartData.push([row.label || row.month, row.total || row.total_revenue]));
            if (chartData.length === 1) chartData.push(['-', 0]);

            const tableData = window.google.visualization.arrayToDataTable(chartData);
            const options = {
              backgroundColor: 'transparent',
              chartArea: { left: 64, top: 16, width: '88%', height: '74%', backgroundColor: 'transparent' },
              legend: { position: 'none' },
              colors: ['#f59e0b'],
              bar: { groupWidth: '56%' },
              hAxis: {
                title: 'Month',
                textStyle: { color: themeMutedText, fontSize: 12 },
                titleTextStyle: { color: themePanelText, italic: false },
                slantedText: true,
                slantedTextAngle: 35,
                baselineColor: themeGrid,
                gridlines: { color: themeGrid }
              },
              vAxis: {
                title: 'Revenue',
                minValue: 0,
                textStyle: { color: themeMutedText, fontSize: 12 },
                titleTextStyle: { color: themePanelText, italic: false },
                baselineColor: themeGrid,
                gridlines: { color: themeGrid }
              }
            };
            const chart = new window.google.visualization.ColumnChart(allTimeChartEl);
            chart.draw(tableData, options);
          }
        }
      };

      loadGoogleCharts();

      const handleResize = () => drawCharts();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [activeTab, mostSold, salesByDay, revenueList]);

  const fetchTabContent = async () => {
    setLoading(true);
    setCurrentAction('list');
    try {
      if (activeTab === 'dashboard') {
        const liveData = await apiRequest('/admin/dashboard-live-data');
        if (liveData && liveData.success) {
          setKpis(liveData.kpis);
          setSalesByDay(liveData.sales_by_hour || []);
          setMostSold(liveData.most_sold_items || []);
        }
      } else if (activeTab === 'admins') {
        const data = await apiRequest('/admin/manage-admin');
        if (data && data.admins) setAdminsList(data.admins);
      } else if (activeTab === 'categories') {
        const data = await apiRequest('/admin/manage-category');
        if (data && data.categories) setCategoriesList(data.categories);
      } else if (activeTab === 'foods') {
        const data = await apiRequest('/admin/manage-food');
        if (data && data.foods) setFoodsList(data.foods);
        const catData = await apiRequest('/admin/manage-category');
        if (catData && catData.categories) setCategoriesList(catData.categories);
      } else if (activeTab === 'inventory') {
        const data = await apiRequest(`/admin/inventory${lowStockOnly ? '?low=1' : ''}`);
        if (data && data.foods) setFoodsList(data.foods);
      } else if (activeTab === 'orders') {
        const data = await apiRequest('/admin/manage-online-order');
        if (data && data.orders) setOrdersList(data.orders);
        const ridersData = await apiRequest('/admin/manage-delivery-boy');
        if (ridersData && ridersData.riders) setRidersList(ridersData.riders);
      } else if (activeTab === 'users') {
        const data = await apiRequest('/admin/manage-ei-order');
        if (data && data.users) setUsersList(data.users);
      } else if (activeTab === 'restro_categories') {
        const data = await apiRequest('/admin/manage-restro-category');
        if (data && data.categories) setRestroCategoriesList(data.categories);
      } else if (activeTab === 'restro_foods') {
        const data = await apiRequest('/admin/manage-restro-food');
        if (data && data.foods) setRestroFoodsList(data.foods);
      } else if (activeTab === 'restaurants') {
        const data = await apiRequest('/admin/manage-restro');
        if (data && data.restros) setVendorsList(data.restros);
      } else if (activeTab === 'riders') {
        const data = await apiRequest('/admin/manage-delivery-boy');
        if (data && data.riders) setRidersList(data.riders);
      } else if (activeTab === 'rider_payments') {
        const data = await apiRequest('/admin/manage-delivery-payment');
        if (data && data.payments) setRiderPaymentsList(data.payments);
      } else if (activeTab === 'coupons') {
        const data = await apiRequest('/admin/manage-coupons');
        if (data && data.coupons) setCouponsList(data.coupons);
      } else if (activeTab === 'fest_coupons') {
        const data = await apiRequest('/admin/manage-fest-coupon');
        if (data && data.coupons) setFestCouponsList(data.coupons);
      } else if (activeTab === 'repeat_rates') {
        const data = await apiRequest('/admin/manage-repeat-rate');
        if (data && data.customer_orders) {
          setRepeatRatesList(data.customer_orders);
          setTotalRepeatRate(data.total_repeat_rate || 0.0);
        }
      } else if (activeTab === 'revenue') {
        const data = await apiRequest('/admin/monthly-revenue');
        if (data) {
          if (data.sorted_month_totals) setRevenueList(data.sorted_month_totals);
          setAllTimeTotal(data.all_time_total || 0.0);
          setAllTimeOrders(data.all_time_orders || 0);
          setLast12Total(data.last12_total || 0.0);
          setLast12Orders(data.last12_orders || 0);
          setAverageMonthly(data.average_monthly || 0.0);
        }
      } else if (activeTab === 'reviews') {
        const orderData = await apiRequest('/admin/manage-review');
        const kitchenData = await apiRequest('/admin/manage-restro-review');
        setReviewsList({
          order: orderData && orderData.reviews ? orderData.reviews : [],
          kitchen: kitchenData && kitchenData.reviews ? kitchenData.reviews : []
        });
      } else if (activeTab === 'messages') {
        const data = await apiRequest('/admin/messages');
        if (data && data.messages) setMessagesList(data.messages);
      }
    } catch (err) {
      console.error('Failed to sync admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  // SUB-ADMIN CRUD
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('full_name', adminName);
      data.append('username', adminUser);
      data.append('email', adminEmail);
      data.append('password', adminPwd);

      await apiRequest('/admin/add-admin', {
        method: 'POST',
        body: data,
      });

      addAlert('Sub-Admin created successfully.', 'success');
      resetAdminForm();
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to create Admin account.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStartEditAdmin = (admin) => {
    setSelectedItem(admin);
    setAdminName(admin.full_name);
    setAdminUser(admin.username);
    setAdminEmail(admin.email);
    setAdminPwd(''); // Leave password blank if not changing
    setCurrentAction('edit');
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('id', selectedItem.id);
      data.append('full_name', adminName);
      data.append('username', adminUser);
      data.append('email', adminEmail);
      
      await apiRequest('/admin/update-admin', {
        method: 'POST',
        body: data,
      });

      if (adminPwd) {
        const pwdData = new FormData();
        pwdData.append('id', selectedItem.id);
        pwdData.append('new_password', adminPwd);
        pwdData.append('confirm_password', adminPwd);
        await apiRequest('/admin/update-password', {
          method: 'POST',
          body: pwdData,
        });
      }

      addAlert('Admin updated successfully.', 'success');
      resetAdminForm();
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to update Admin account.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Delete this admin account?')) return;
    try {
      await apiRequest(`/admin/delete-admin?id=${id}`);
      addAlert('Admin account deleted.', 'warning');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to delete account.', 'danger');
    }
  };

  const resetAdminForm = () => {
    setAdminName('');
    setAdminUser('');
    setAdminEmail('');
    setAdminPwd('');
    setCurrentAction('list');
    setSelectedItem(null);
  };

  // CATEGORY OPERATIONS
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('title', catTitle);
      data.append('featured', catFeatured);
      data.append('active', catActive);
      if (catImageFile) data.append('image', catImageFile);

      await apiRequest('/admin/add-category', {
        method: 'POST',
        body: data,
      });

      addAlert('Category added successfully!', 'success');
      resetCatForm();
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to add category.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStartEditCategory = (cat) => {
    setSelectedItem(cat);
    setCatTitle(cat.title);
    setCatFeatured(cat.featured);
    setCatActive(cat.active);
    setCatImagePreview(cat.image_name ? `/images/category/${cat.image_name}` : '');
    setCatImageFile(null);
    setCurrentAction('edit');
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('id', selectedItem.id);
      data.append('title', catTitle);
      data.append('featured', catFeatured);
      data.append('active', catActive);
      if (catImageFile) data.append('image', catImageFile);

      await apiRequest('/admin/update-category', {
        method: 'POST',
        body: data,
      });

      addAlert('Category updated successfully!', 'success');
      resetCatForm();
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to update category.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await apiRequest(`/admin/delete-category?id=${id}`);
      addAlert('Category deleted.', 'warning');
      fetchTabContent();
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
    setCurrentAction('list');
    setSelectedItem(null);
  };

  // FOOD OPERATIONS
  const handleAddFood = async (e) => {
    e.preventDefault();
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
      if (foodImageFile) data.append('image', foodImageFile);

      await apiRequest('/admin/add-food', {
        method: 'POST',
        body: data,
      });

      addAlert('Menu item added successfully!', 'success');
      resetFoodForm();
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to add menu item.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStartEditFood = (food) => {
    setSelectedItem(food);
    setFoodTitle(food.title);
    setFoodDescription(food.description || '');
    setFoodPrice(food.price);
    setFoodCategory(food.category_id);
    setFoodFeatured(food.featured);
    setFoodActive(food.active);
    setFoodStock(food.stock);
    setFoodImagePreview(food.image_name ? `/images/food/${food.image_name}` : '');
    setFoodImageFile(null);
    setCurrentAction('edit');
  };

  const handleEditFood = async (e) => {
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
      if (foodImageFile) data.append('image', foodImageFile);

      await apiRequest('/admin/update-food', {
        method: 'POST',
        body: data,
      });

      addAlert('Food item updated successfully!', 'success');
      resetFoodForm();
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to update food item.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      await apiRequest(`/admin/delete-food?id=${id}`);
      addAlert('Food item deleted.', 'warning');
      fetchTabContent();
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
    setCurrentAction('list');
    setSelectedItem(null);
  };

  // INVENTORY OPERATIONS
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('id', stockEditId);
      data.append('stock', String(stockEditQty));

      await apiRequest('/admin/update-inventory', {
        method: 'POST',
        body: data,
      });

      addAlert('Inventory stock level updated.', 'success');
      setStockEditId(null);
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to update stock level.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ORDER DISPATCH
  const handleLoadDispatchOrder = (order) => {
    setDispatchOrderId(order.order_id);
    setDispatchRiderName(order.delivery_boy_name || '');
    setDispatchStatus(order.order_status || '');
    setDispatchPaymentStatus(order.payment_status || '');
  };

  const handleUpdateOrderDispatch = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('id', dispatchOrderId);
      data.append('order_status', dispatchStatus);
      data.append('payment_status', dispatchPaymentStatus);
      data.append('delivery_boy_name', dispatchRiderName);

      await apiRequest('/admin/update-online-order', {
        method: 'POST',
        body: data,
      });

      addAlert('Order parameters updated successfully!', 'success');
      setDispatchOrderId(null);
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to update order details.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  // USER MANAGEMENT
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const data = new FormData();
      data.append('user_id', userId);
      data.append('role', newRole);

      await apiRequest('/admin/update-user-role', {
        method: 'POST',
        body: data,
      });

      addAlert('User privileges updated.', 'success');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to alter user privileges.', 'danger');
    }
  };

  // VENDOR APPROVALS
  const handleUpdateRestroStatus = async (vendorId, status) => {
    try {
      const data = new FormData();
      data.append('id', vendorId);
      data.append('status', status);

      await apiRequest('/admin/update-restro-status', {
        method: 'POST',
        body: data,
      });

      addAlert(`Restaurant status updated to ${status}!`, 'success');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to update vendor status.', 'danger');
    }
  };

  // KITCHEN CATEGORY APPROVALS
  const handleUpdateRestroCategoryStatus = async (cid, status) => {
    try {
      const data = new FormData();
      data.append('cid', cid);
      data.append('status', status);
      await apiRequest('/admin/update-restro-category', {
        method: 'POST',
        body: data,
      });
      addAlert(`Kitchen category status set to ${status}.`, 'success');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to update kitchen category status.', 'danger');
    }
  };

  // KITCHEN FOOD APPROVALS
  const handleUpdateRestroFoodStatus = async (id, status) => {
    try {
      const data = new FormData();
      data.append('id', id);
      data.append('status', status);
      await apiRequest('/admin/update-restro-food', {
        method: 'POST',
        body: data,
      });
      addAlert(`Kitchen food status set to ${status}.`, 'success');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to update kitchen food status.', 'danger');
    }
  };

  // RIDER VERIFICATION
  const handleUpdateRiderStatus = async (riderId, status) => {
    try {
      const data = new FormData();
      data.append('id', riderId);
      data.append('status', status);

      await apiRequest('/admin/update-delivery-boy-status', {
        method: 'POST',
        body: data,
      });

      addAlert(`Rider status set to ${status}!`, 'success');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to update rider parameters.', 'danger');
    }
  };

  const handleUpdateRiderRole = async (riderId, role) => {
    try {
      const data = new FormData();
      data.append('id', riderId);
      data.append('role', String(role));

      await apiRequest('/admin/update-delivery-boy-status', {
        method: 'POST',
        body: data,
      });

      addAlert(`Rider role updated successfully.`, 'success');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to update rider role.', 'danger');
    }
  };

  const handleDeleteRider = async (id) => {
    if (!window.confirm('Delete this delivery boy account permanently?')) return;
    try {
      const data = new FormData();
      data.append('id', id);
      await apiRequest('/admin/delete-delivery-boy', {
        method: 'POST',
        body: data
      });
      addAlert('Delivery boy deleted.', 'warning');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to delete delivery boy account.', 'danger');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user account permanently?')) return;
    try {
      const data = new FormData();
      data.append('id', id);
      await apiRequest('/admin/delete-ei-order', {
        method: 'POST',
        body: data
      });
      addAlert('User account deleted.', 'warning');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to delete user account.', 'danger');
    }
  };

  // RIDER PAYMENT SETTLEMENT
  const handleSettleRiderPayment = async (payId) => {
    if (!window.confirm('Settle this payment? Status will be marked as paid.')) return;
    try {
      const data = new FormData();
      data.append('id', payId);
      await apiRequest('/admin/manage-delivery-payment', {
        method: 'POST',
        body: data,
      });
      addAlert('Rider payment settled successfully.', 'success');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to settle payment.', 'danger');
    }
  };

  // COUPON OPERATIONS
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('coupon_code', couponCode);
      data.append('discount_percentage', couponDiscount);
      data.append('active', couponActive);

      await apiRequest('/admin/add-coupon', {
        method: 'POST',
        body: data,
      });

      addAlert('Discount Coupon configured successfully!', 'success');
      setCouponCode('');
      setCouponDiscount('');
      setCouponActive('Yes');
      setCurrentAction('list');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to save Coupon.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStartEditCoupon = (cpn) => {
    setSelectedItem(cpn);
    setCouponCode(cpn.coupon_code);
    setCouponDiscount(cpn.discount_percentage || cpn.discount);
    setCouponActive(cpn.active || (cpn.status === 'active' ? 'Yes' : 'No'));
    setCurrentAction('edit');
  };

  const handleEditCoupon = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('id', selectedItem.id);
      data.append('coupon_code', couponCode);
      data.append('discount_percentage', couponDiscount);
      data.append('active', couponActive);

      await apiRequest('/admin/update-coupon', {
        method: 'POST',
        body: data,
      });

      addAlert('Coupon updated successfully!', 'success');
      setCouponCode('');
      setCouponDiscount('');
      setCouponActive('Yes');
      setCurrentAction('list');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to save Coupon.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      await apiRequest(`/admin/delete-coupon?id=${id}`);
      addAlert('Coupon deleted.', 'warning');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to delete coupon.', 'danger');
    }
  };

  // FESTIVAL COUPON OPERATIONS
  const handleAddFestCoupon = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('festival_name', festName);
      data.append('coupon_code', festCode);
      data.append('discount', festDiscount);
      data.append('duration', festDuration);
      data.append('status', festStatus);

      await apiRequest('/admin/add-fest-coupon', {
        method: 'POST',
        body: data,
      });

      addAlert('Festival Coupon added successfully!', 'success');
      resetFestForm();
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to add Festival Coupon.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStartEditFestCoupon = (cpn) => {
    setSelectedItem(cpn);
    setFestName(cpn.festival_name);
    setFestCode(cpn.coupon_code);
    setFestDiscount(cpn.discount);
    setFestDuration(cpn.duration);
    setFestStatus(cpn.status);
    setFestExpire(cpn.expire);
    setCurrentAction('edit');
  };

  const handleEditFestCoupon = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('id', selectedItem.id);
      data.append('festival_name', festName);
      data.append('coupon_code', festCode);
      data.append('discount', festDiscount);
      data.append('duration', festDuration);
      data.append('status', festStatus);
      data.append('expire', festExpire);

      await apiRequest('/admin/update-fest-coupon', {
        method: 'POST',
        body: data,
      });

      addAlert('Festival Coupon updated successfully!', 'success');
      resetFestForm();
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to update Festival Coupon.', 'danger');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteFestCoupon = async (id) => {
    if (!window.confirm('Delete this festival coupon?')) return;
    try {
      await apiRequest(`/admin/delete-fest-coupon?id=${id}`);
      addAlert('Festival Coupon deleted.', 'warning');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to delete Festival Coupon.', 'danger');
    }
  };

  const resetFestForm = () => {
    setFestName('');
    setFestCode('');
    setFestDiscount('');
    setFestDuration('7');
    setFestStatus('active');
    setFestExpire('active');
    setCurrentAction('list');
    setSelectedItem(null);
  };

  // MESSAGES
  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Remove message from inbox?')) return;
    try {
      await apiRequest(`/admin/delete-message?id=${id}`);
      addAlert('Message removed.', 'warning');
      fetchTabContent();
    } catch (err) {
      addAlert('Failed to remove message.', 'danger');
    }
  };

  return (
    <div className="fade-in">
      
      {/* Inject custom inline styles for Monthly Revenue page components */}
      <style>{`
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
      `}</style>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid rgba(230,149,0,0.1)', borderTopColor: '#e69500', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* TAB: DASHBOARD INDEX */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>Dashboard</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                  </ul>
                </div>
              </div>

              <div className="dashboard-grid">
                <Link to="/admin/manage-category" className="kpi-card kpi-card-blue">
                  <div className="kpi-media">
                    <img src="/static/images/inventory.png" alt="Categories" onError={(e) => e.target.src = 'https://placehold.co/100x50'} />
                    <span className="kpi-badge">Live</span>
                  </div>
                  <div className="kpi-meta">
                    <h3 className="kpi-value">{kpis.categories}</h3>
                    <p className="kpi-label">Categories</p>
                  </div>
                </Link>

                <Link to="/admin/manage-delivery-payment" className="kpi-card kpi-card-gold">
                  <div className="kpi-media">
                    <img src="/static/images/revenue.png" alt="Revenue" onError={(e) => e.target.src = 'https://placehold.co/100x50'} />
                    <span className="kpi-badge">Live</span>
                  </div>
                  <div className="kpi-meta">
                    <h3 className="kpi-value">Rs {kpis.revenue}</h3>
                    <p className="kpi-label">Revenue Generated</p>
                  </div>
                </Link>

                <Link to="/admin/manage-online-order" className="kpi-card kpi-card-violet">
                  <div className="kpi-media">
                    <img src="/static/images/orders_completed.png" alt="Orders Completed" onError={(e) => e.target.src = 'https://placehold.co/100x50'} />
                    <span className="kpi-badge">Live</span>
                  </div>
                  <div className="kpi-meta">
                    <h3 className="kpi-value">{kpis.orders_completed}</h3>
                    <p className="kpi-label">Orders Completed</p>
                  </div>
                </Link>

                <Link to="/admin/manage-food" className="kpi-card kpi-card-red">
                  <div className="kpi-media">
                    <img src="/static/images/folder2.png" alt="Menu Items" onError={(e) => e.target.src = 'https://placehold.co/100x50'} />
                    <span className="kpi-badge">Live</span>
                  </div>
                  <div className="kpi-meta">
                    <h3 className="kpi-value">{kpis.menu_items}</h3>
                    <p className="kpi-label">Menu Items</p>
                  </div>
                </Link>
              </div>

              {/* Chart */}
              <div className="dashboard-charts">
                <div className="chart-panel">
                  <div className="panel-head">
                    <h3>Most Sold Items</h3>
                    <span className="panel-chip">Live Data</span>
                  </div>
                  <div className="chart" id="donutchart_msi" style={{ minHeight: '300px' }}></div>
                </div>
                <div className="chart-panel">
                  <div className="panel-head">
                    <h3>Sales By Day</h3>
                    <span className="panel-chip">Last 7 days</span>
                  </div>
                  <div className="chart" id="columnchart_material" style={{ minHeight: '300px' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SUB-ADMINS */}
          {activeTab === 'admins' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>Admin Panel</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/manage-admin">Admin Panel</Link></li>
                    {currentAction === 'add' && (
                      <>
                        <li><i className="bx bx-chevron-right"></i></li>
                        <li><Link className="active" to="/admin/manage-admin">Add Admin</Link></li>
                      </>
                    )}
                    {currentAction === 'edit' && (
                      <>
                        <li><i className="bx bx-chevron-right"></i></li>
                        <li><Link className="active" to="/admin/manage-admin">Update Admin</Link></li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {currentAction === 'list' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>Administrators</h3>
                      <button 
                        onClick={() => setCurrentAction('add')}
                        className="button-6"
                        role="button"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Plus size={16} />
                        <span>Add Admin</span>
                      </button>
                    </div>

                    <table>
                      <thead>
                        <tr>
                          <th>S.N.</th>
                          <th>Full Name</th>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminsList.map((adm, idx) => (
                          <tr key={adm.id}>
                            <td>{idx + 1}.</td>
                            <td>{adm.full_name}</td>
                            <td>{adm.username}</td>
                            <td>{adm.email}</td>
                            <td className="table-actions">
                              <button onClick={() => handleStartEditAdmin(adm)} className="button-8" role="button">Update Admin</button>
                              <button onClick={() => handleDeleteAdmin(adm.id)} className="button-7" role="button">Delete Admin</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {currentAction === 'add' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>Add New Admin</h3>
                    </div>
                    <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Username</label>
                        <input type="text" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" value={adminPwd} onChange={(e) => setAdminPwd(e.target.value)} required />
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" disabled={submitLoading} className="button-8" role="button">
                          {submitLoading ? 'Creating...' : 'Add Admin'}
                        </button>
                        <button type="button" onClick={resetAdminForm} className="button-5" role="button">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {currentAction === 'edit' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>Edit Admin Account</h3>
                    </div>
                    <form onSubmit={handleEditAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Username</label>
                        <input type="text" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">New Password (leave blank to keep current)</label>
                        <input type="password" value={adminPwd} onChange={(e) => setAdminPwd(e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" disabled={submitLoading} className="button-8" role="button">
                          {submitLoading ? 'Updating...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={resetAdminForm} className="button-5" role="button">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: GLOBAL CATEGORIES */}
          {activeTab === 'categories' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>Categories</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/manage-category">Category</Link></li>
                    {currentAction === 'add' && (
                      <>
                        <li><i className="bx bx-chevron-right"></i></li>
                        <li><Link className="active" to="/admin/manage-category">Add Category</Link></li>
                      </>
                    )}
                    {currentAction === 'edit' && (
                      <>
                        <li><i className="bx bx-chevron-right"></i></li>
                        <li><Link className="active" to="/admin/manage-category">Update Category</Link></li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {currentAction === 'list' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>All Categories</h3>
                      <button 
                        onClick={() => setCurrentAction('add')}
                        className="button-6"
                        role="button"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Plus size={16} />
                        <span>Add Category</span>
                      </button>
                    </div>

                    <table>
                      <thead>
                        <tr>
                          <th>S.N.</th>
                          <th>Title</th>
                          <th>Image</th>
                          <th>Featured</th>
                          <th>Active</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoriesList.map((cat, idx) => (
                          <tr key={cat.id}>
                            <td>{idx + 1}.</td>
                            <td>{cat.title}</td>
                            <td>
                              {cat.image_name ? (
                                <img src={`/images/category/${cat.image_name}`} alt={cat.title} style={{ width: '100px', borderRadius: '10px' }} onError={(e) => e.target.src = 'https://placehold.co/100x50'} />
                              ) : (
                                <span className="error">Image not added</span>
                              )}
                            </td>
                            <td>{cat.featured}</td>
                            <td>{cat.active}</td>
                            <td className="table-actions">
                              <button onClick={() => handleStartEditCategory(cat)} className="button-8" role="button">Update Category</button>
                              <button onClick={() => handleDeleteCategory(cat.id)} className="button-7" role="button">Delete Category</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {currentAction === 'add' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>Add Category</h3>
                    </div>
                    <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Category Title</label>
                        <input type="text" value={catTitle} onChange={(e) => setCatTitle(e.target.value)} required />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                          <label className="form-label">Featured</label>
                          <select value={catFeatured} onChange={(e) => setCatFeatured(e.target.value)}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Active</label>
                          <select value={catActive} onChange={(e) => setCatActive(e.target.value)}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Category Banner</label>
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '120px', border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '12px', cursor: 'pointer', background: catImagePreview ? `url(${catImagePreview}) center/cover no-repeat` : 'rgba(0,0,0,0.02)' }}>
                          {!catImagePreview && (
                            <>
                              <Upload size={24} style={{ color: '#fea116', marginBottom: '6px' }} />
                              <span>Upload Image</span>
                            </>
                          )}
                          <input type="file" onChange={(e) => { const file = e.target.files[0]; if (file) { setCatImageFile(file); setCatImagePreview(URL.createObjectURL(file)); } }} accept="image/*" style={{ display: 'none' }} />
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" disabled={submitLoading} className="button-8" role="button">
                          {submitLoading ? 'Saving...' : 'Save Category'}
                        </button>
                        <button type="button" onClick={resetCatForm} className="button-5" role="button">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {currentAction === 'edit' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>Update Category</h3>
                    </div>
                    <form onSubmit={handleEditCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Category Title</label>
                        <input type="text" value={catTitle} onChange={(e) => setCatTitle(e.target.value)} required />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                          <label className="form-label">Featured</label>
                          <select value={catFeatured} onChange={(e) => setCatFeatured(e.target.value)}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Active</label>
                          <select value={catActive} onChange={(e) => setCatActive(e.target.value)}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Category Banner</label>
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '120px', border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '12px', cursor: 'pointer', background: catImagePreview ? `url(${catImagePreview}) center/cover no-repeat` : 'rgba(0,0,0,0.02)' }}>
                          {!catImagePreview && (
                            <>
                              <Upload size={24} style={{ color: '#fea116', marginBottom: '6px' }} />
                              <span>Upload Image</span>
                            </>
                          )}
                          <input type="file" onChange={(e) => { const file = e.target.files[0]; if (file) { setCatImageFile(file); setCatImagePreview(URL.createObjectURL(file)); } }} accept="image/*" style={{ display: 'none' }} />
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" disabled={submitLoading} className="button-8" role="button">
                          {submitLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={resetCatForm} className="button-5" role="button">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: GLOBAL FOOD MENU */}
          {activeTab === 'foods' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>Food Menu</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/manage-food">Food Menu</Link></li>
                    {currentAction === 'add' && (
                      <>
                        <li><i className="bx bx-chevron-right"></i></li>
                        <li><Link className="active" to="/admin/manage-food">Add Food</Link></li>
                      </>
                    )}
                    {currentAction === 'edit' && (
                      <>
                        <li><i className="bx bx-chevron-right"></i></li>
                        <li><Link className="active" to="/admin/manage-food">Update Food</Link></li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {currentAction === 'list' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>All central Food Items</h3>
                      <button 
                        onClick={() => setCurrentAction('add')}
                        className="button-6"
                        role="button"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Plus size={16} />
                        <span>Add Food</span>
                      </button>
                    </div>

                    <table>
                      <thead>
                        <tr>
                          <th>S.N.</th>
                          <th>Title</th>
                          <th>Price</th>
                          <th>Image</th>
                          <th>Featured</th>
                          <th>Active</th>
                          <th>Stock</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {foodsList.map((food, idx) => (
                          <tr key={food.id}>
                            <td>{idx + 1}.</td>
                            <td>{food.title}</td>
                            <td>Rs {food.price}</td>
                            <td>
                              {food.image_name ? (
                                <img src={`/images/food/${food.image_name}`} alt={food.title} style={{ width: '80px', borderRadius: '10px' }} onError={(e) => e.target.src = 'https://placehold.co/100x50'} />
                              ) : (
                                <span className="error">Image not added</span>
                              )}
                            </td>
                            <td>{food.featured}</td>
                            <td>{food.active}</td>
                            <td>
                              {food.stock <= 3 ? (
                                <span className="status pending" style={{ padding: '4px 10px', fontWeight: 'bold' }}>{food.stock} (Low)</span>
                              ) : (
                                <span className="status process" style={{ padding: '4px 10px', fontWeight: 'bold' }}>{food.stock}</span>
                              )}
                            </td>
                            <td className="table-actions">
                              <button onClick={() => handleStartEditFood(food)} className="button-8" role="button">Update Food</button>
                              <button onClick={() => handleDeleteFood(food.id)} className="button-7" role="button">Delete Food</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {currentAction === 'add' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>Add Central Food Item</h3>
                    </div>
                    <form onSubmit={handleAddFood} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Dish Title</label>
                        <input type="text" value={foodTitle} onChange={(e) => setFoodTitle(e.target.value)} required />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea value={foodDescription} onChange={(e) => setFoodDescription(e.target.value)} style={{ minHeight: '80px' }} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Price (Rs)</label>
                          <input type="number" step="0.01" value={foodPrice} onChange={(e) => setFoodPrice(e.target.value)} required />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Category</label>
                          <select value={foodCategory} onChange={(e) => setFoodCategory(e.target.value)} required>
                            <option value="">Select Category</option>
                            {categoriesList.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.title}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Featured</label>
                          <select value={foodFeatured} onChange={(e) => setFoodFeatured(e.target.value)}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Active</label>
                          <select value={foodActive} onChange={(e) => setFoodActive(e.target.value)}>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Stock Quantity</label>
                          <input type="number" value={foodStock} onChange={(e) => setFoodStock(e.target.value)} required />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Dish Image</label>
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '120px', border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '12px', cursor: 'pointer', background: foodImagePreview ? `url(${foodImagePreview}) center/cover no-repeat` : 'rgba(0,0,0,0.02)' }}>
                          {!foodImagePreview && (
                            <>
                              <Upload size={24} style={{ color: '#fea116', marginBottom: '6px' }} />
                              <span>Upload Image</span>
                            </>
                          )}
                          <input type="file" onChange={(e) => { const file = e.target.files[0]; if (file) { setFoodImageFile(file); setFoodImagePreview(URL.createObjectURL(file)); } }} accept="image/*" style={{ display: 'none' }} />
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" disabled={submitLoading} className="button-8" role="button">
                          {submitLoading ? 'Saving...' : 'Save Food'}
                        </button>
                        <button type="button" onClick={resetFoodForm} className="button-5" role="button">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {currentAction === 'edit' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>Update Food Item</h3>
                    </div>
                    <form onSubmit={handleEditFood} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Dish Title</label>
                        <input type="text" value={foodTitle} onChange={(e) => setFoodTitle(e.target.value)} required />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea value={foodDescription} onChange={(e) => setFoodDescription(e.target.value)} style={{ minHeight: '80px' }} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Price (Rs)</label>
                          <input type="number" step="0.01" value={foodPrice} onChange={(e) => setFoodPrice(e.target.value)} required />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Category</label>
                          <select value={foodCategory} onChange={(e) => setFoodCategory(e.target.value)} required>
                            <option value="">Select Category</option>
                            {categoriesList.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.title}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Featured</label>
                          <select value={foodFeatured} onChange={(e) => setFoodFeatured(e.target.value)}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Active</label>
                          <select value={foodActive} onChange={(e) => setFoodActive(e.target.value)}>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Stock Quantity</label>
                          <input type="number" value={foodStock} onChange={(e) => setFoodStock(e.target.value)} required />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Dish Image</label>
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '120px', border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '12px', cursor: 'pointer', background: foodImagePreview ? `url(${foodImagePreview}) center/cover no-repeat` : 'rgba(0,0,0,0.02)' }}>
                          {!foodImagePreview && (
                            <>
                              <Upload size={24} style={{ color: '#fea116', marginBottom: '6px' }} />
                              <span>Upload Image</span>
                            </>
                          )}
                          <input type="file" onChange={(e) => { const file = e.target.files[0]; if (file) { setFoodImageFile(file); setFoodImagePreview(URL.createObjectURL(file)); } }} accept="image/*" style={{ display: 'none' }} />
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" disabled={submitLoading} className="button-8" role="button">
                          {submitLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={resetFoodForm} className="button-5" role="button">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: GLOBAL INVENTORY */}
          {activeTab === 'inventory' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>Inventory</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/inventory">Inventory</Link></li>
                  </ul>
                </div>
              </div>

              <div className="table-data">
                <div className="order">
                  <div className="head" style={{ justifyContent: 'space-between' }}>
                    <h3>Stock Control</h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                      <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
                      <span>Show Low Stock Items Only (&le; 3)</span>
                    </label>
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>S.N.</th>
                        <th>Food Item</th>
                        <th>Current Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodsList.map((food, idx) => (
                        <tr key={food.id}>
                          <td>{idx + 1}.</td>
                          <td>{food.title}</td>
                          <td>
                            {stockEditId === food.id ? (
                              <input type="number" value={stockEditQty} onChange={(e) => setStockEditQty(e.target.value)} style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} />
                            ) : (
                              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{food.stock}</span>
                            )}
                          </td>
                          <td>
                            {food.stock <= 3 ? (
                              <span className="status pending" style={{ padding: '4px 10px', fontWeight: 'bold' }}>Low Stock</span>
                            ) : (
                              <span className="status process" style={{ padding: '4px 10px', fontWeight: 'bold' }}>In Stock</span>
                            )}
                          </td>
                          <td className="table-actions">
                            {stockEditId === food.id ? (
                              <div style={{ display: 'inline-flex', gap: '8px' }}>
                                <button onClick={handleUpdateStock} disabled={submitLoading} style={{ background: '#22c55e', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}><Check size={16} /></button>
                                <button onClick={() => setStockEditId(null)} style={{ background: '#64748b', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}><X size={16} /></button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => { setStockEditId(food.id); setStockEditQty(food.stock); }} 
                                className="button-8"
                                role="button"
                              >
                                Update Stock
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ONLINE ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>Online Orders</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/manage-online-order">Online Orders</Link></li>
                    {dispatchOrderId && (
                      <>
                        <li><i className="bx bx-chevron-right"></i></li>
                        <li><span className="active">Update Order</span></li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {dispatchOrderId ? (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>Update Order #{dispatchOrderId}</h3>
                    </div>
                    <form onSubmit={handleUpdateOrderDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 'bold', color: '#475569' }}>Assign Delivery Rider</label>
                        <select 
                          value={dispatchRiderName} 
                          onChange={(e) => setDispatchRiderName(e.target.value)} 
                          className="form-control"
                        >
                          <option value="">Unassigned</option>
                          {ridersList.map(r => (
                            <option key={r.id} value={r.username}>{r.name} ({r.username})</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', color: '#475569' }}>Order Status</label>
                          <select 
                            value={dispatchStatus} 
                            onChange={(e) => setDispatchStatus(e.target.value)} 
                            className="form-control" 
                            required
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="OnTheWay">OnTheWay</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', color: '#475569' }}>Payment Status</label>
                          <select 
                            value={dispatchPaymentStatus} 
                            onChange={(e) => setDispatchPaymentStatus(e.target.value)} 
                            className="form-control" 
                            required
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" disabled={submitLoading} className="button-8" role="button">
                          {submitLoading ? 'Updating...' : 'Save Parameters'}
                        </button>
                        <button type="button" onClick={() => setDispatchOrderId(null)} className="button-5" role="button">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>All Customer Orders</h3>
                    </div>

                    {ordersList.length === 0 ? (
                      <p style={{ color: '#64748b', padding: '1rem' }}>No online orders registered.</p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer Details</th>
                            <th>Items Purchased</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Delivery Boy</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ordersList.map((order) => (
                            <tr key={order.order_id}>
                              <td>#{order.order_id}</td>
                              <td style={{ textAlign: 'left' }}>
                                <strong>Name:</strong> {order.cus_name}<br />
                                <strong>Phone:</strong> {order.cus_phone}<br />
                                <strong>Address:</strong> {order.cus_add1}
                              </td>
                              <td style={{ textAlign: 'left' }}>
                                {order.items.map((item, idx) => (
                                  <div key={idx}>- {item.name} (x{item.qty})</div>
                                ))}
                              </td>
                              <td>
                                Rs {order.total_amount}<br />
                                <span className="status process" style={{ padding: '2px 6px', fontSize: '10px' }}>{order.payment_status}</span>
                              </td>
                              <td>{new Date(order.order_date).toLocaleString()}</td>
                              <td>
                                <span className={`status ${order.order_status === 'Delivered' ? 'completed' : order.order_status === 'Cancelled' ? 'cancelled' : 'pending'}`}>
                                  {order.order_status}
                                </span>
                              </td>
                              <td>
                                {order.delivery_boy_name ? (
                                  <span className="status completed">{order.delivery_boy_name}</span>
                                ) : (
                                  <span className="error">Not Assigned</span>
                                )}
                              </td>
                              <td className="table-actions">
                                <button 
                                  onClick={() => handleLoadDispatchOrder(order)} 
                                  className="button-8"
                                  role="button"
                                >
                                  Update
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: REGISTERED CUSTOMERS */}
          {activeTab === 'users' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>User Information</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/manage-ei-order">User Information</Link></li>
                  </ul>
                </div>
              </div>

              <div className="table-data">
                <div className="order">
                  <div className="head">
                    <h3>Registered Customers</h3>
                  </div>

                  {usersList.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem' }}>No customers registered.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Id</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Address</th>
                          <th>City</th>
                          <th>Mobile Number</th>
                          <th>Username</th>
                          <th>User Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((customer, idx) => (
                          <tr key={customer.id}>
                            <td>{idx + 1}.</td>
                            <td>{customer.name}</td>
                            <td>{customer.email}</td>
                            <td>{customer.add1}</td>
                            <td>{customer.city}</td>
                            <td><span className="status process">{customer.phone}</span></td>
                            <td>{customer.username}</td>
                            <td>
                              <span style={{ color: customer.user_role === 1 ? 'green' : 'red', fontWeight: 'bold' }}>
                                {customer.user_role === 1 ? 'Active' : 'Blocked'}
                              </span>
                            </td>
                            <td className="table-actions">
                              {customer.user_role === 1 ? (
                                <button 
                                  onClick={() => handleUpdateUserRole(customer.id, 0)} 
                                  className="button-5"
                                  role="button"
                                >
                                  Block
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUpdateUserRole(customer.id, 1)} 
                                  className="button-5"
                                  role="button"
                                  style={{ background: '#22c55e' }}
                                >
                                  Unblock
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteUser(customer.id)} 
                                className="button-7"
                                role="button"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: KITCHEN CATEGORIES */}
          {activeTab === 'restro_categories' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>All Restro Categories</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/manage-restro-category">Restro Categories</Link></li>
                  </ul>
                </div>
              </div>

              <div className="table-data">
                <div className="order">
                  <div className="head">
                    <h3>Vendor Custom Categories</h3>
                  </div>

                  {restroCategoriesList.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem' }}>No custom categories pending approval.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>S.N.</th>
                          <th>Title</th>
                          <th>Image</th>
                          <th>Featured</th>
                          <th>Active</th>
                          <th>Restaurant</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {restroCategoriesList.map((cat, idx) => (
                          <tr key={cat.cid}>
                            <td>{idx + 1}.</td>
                            <td>{cat.title}</td>
                            <td>
                              {cat.image_name ? (
                                <img src={`/uploads/category/${cat.image_name}`} alt={cat.title} style={{ width: '80px', borderRadius: '10px' }} onError={(e) => e.target.src = 'https://placehold.co/80x50'} />
                              ) : (
                                <span className="error">No Image</span>
                              )}
                            </td>
                            <td>{cat.featured}</td>
                            <td>{cat.active}</td>
                            <td>{cat.restro_name}</td>
                            <td>
                              <span className={`status ${cat.status === 'approved' ? 'completed' : 'pending'}`}>
                                {cat.status}
                              </span>
                            </td>
                            <td className="table-actions">
                              {cat.status !== 'approved' ? (
                                <>
                                  <button onClick={() => handleUpdateRestroCategoryStatus(cat.cid, 'approved')} className="button-8" role="button">Approve</button>
                                  <button onClick={() => handleUpdateRestroCategoryStatus(cat.cid, 'not_approved')} className="button-7" role="button">Reject</button>
                                </>
                              ) : (
                                <span className="status completed" style={{ background: '#22c55e' }}>Fully Approved</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: KITCHEN FOODS */}
          {activeTab === 'restro_foods' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>All Restro Food Items</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/manage-restro-food">Restro Food Items</Link></li>
                  </ul>
                </div>
              </div>

              <div className="table-data">
                <div className="order">
                  <div className="head">
                    <h3>Vendor Custom Food Items</h3>
                  </div>

                  {restroFoodsList.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem' }}>No custom food items pending approval.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>S.N.</th>
                          <th>Food details</th>
                          <th>Image</th>
                          <th>Category ID</th>
                          <th>Restaurant</th>
                          <th>Featured</th>
                          <th>Active</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {restroFoodsList.map((food, idx) => (
                          <tr key={food.id}>
                            <td>{idx + 1}.</td>
                            <td style={{ textAlign: 'left' }}>
                              <strong>Title:</strong> {food.title}<br />
                              <strong>Price:</strong> Rs {food.price}<br />
                              <strong>Description:</strong> {food.description}
                            </td>
                            <td>
                              {food.image_name ? (
                                <img src={`/uploads/food/${food.image_name}`} alt={food.title} style={{ width: '80px', borderRadius: '10px' }} onError={(e) => e.target.src = 'https://placehold.co/80x50'} />
                              ) : (
                                <span className="error">No Image</span>
                              )}
                            </td>
                            <td>{food.cid}</td>
                            <td>{food.restro_name}</td>
                            <td>{food.featured}</td>
                            <td>{food.active}</td>
                            <td>{food.stock}</td>
                            <td>
                              <span className={`status ${food.status === 'approved' ? 'completed' : 'pending'}`}>
                                {food.status}
                              </span>
                            </td>
                            <td className="table-actions">
                              {food.status !== 'approved' ? (
                                <>
                                  <button onClick={() => handleUpdateRestroFoodStatus(food.id, 'approved')} className="button-8" role="button">Approve</button>
                                  <button onClick={() => handleUpdateRestroFoodStatus(food.id, 'not_approved')} className="button-7" role="button">Reject</button>
                                </>
                              ) : (
                                <span className="status completed" style={{ background: '#22c55e' }}>Fully Approved</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: VENDORS */}
          {activeTab === 'restaurants' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>All Restaurants</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/manage-restro">All Restro</Link></li>
                  </ul>
                </div>
              </div>

              <div className="table-data">
                <div className="order">
                  <div className="head">
                    <h3>Registered Restaurants</h3>
                  </div>

                  {vendorsList.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem' }}>No vendor partners registered.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>S.N.</th>
                          <th>Restro Details</th>
                          <th>Image</th>
                          <th>Licence</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendorsList.map((vendor, idx) => (
                          <tr key={vendor.id}>
                            <td>{idx + 1}.</td>
                            <td style={{ textAlign: 'left' }}>
                              <strong>Name:</strong> {vendor.restro_name}<br />
                              <strong>Username:</strong> {vendor.username}<br />
                              <strong>Email:</strong> {vendor.email}<br />
                              <strong>Mobile:</strong> {vendor.mobile_no}<br />
                              <strong>Address:</strong> {vendor.restro_address}
                            </td>
                            <td>
                              {vendor.restro_image ? (
                                <img src={`/${vendor.restro_image}`} alt={vendor.restro_name} style={{ width: '100px', borderRadius: '10px' }} onError={(e) => e.target.src = 'https://placehold.co/100x50'} />
                              ) : (
                                <span className="error">No Image</span>
                              )}
                            </td>
                            <td>
                              {vendor.food_licence_image ? (
                                <a href={`/${vendor.food_licence_image}`} target="_blank" rel="noreferrer">
                                  <img src={`/${vendor.food_licence_image}`} alt="Licence" style={{ width: '100px', borderRadius: '10px', border: '1px solid #ccc' }} onError={(e) => e.target.src = 'https://placehold.co/100x50'} />
                                </a>
                              ) : (
                                <span className="error">No Licence Uploaded</span>
                              )}
                            </td>
                            <td>
                              <span className={`status ${vendor.status === 'approved' ? 'completed' : 'pending'}`}>
                                {vendor.status === 'approved' ? 'Approved' : 'Not Approved'}
                              </span>
                            </td>
                            <td className="table-actions">
                              {vendor.status === 'approved' ? (
                                <button onClick={() => handleUpdateRestroStatus(vendor.id, 'not_approved')} className="button-7" role="button">Reject / Suspend</button>
                              ) : (
                                <button onClick={() => handleUpdateRestroStatus(vendor.id, 'approved')} className="button-8" role="button">Approve</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: DELIVERY BOY RIDERS */}
          {activeTab === 'riders' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>Delivery Boy</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/manage-delivery-boy">Delivery Boy</Link></li>
                  </ul>
                </div>
              </div>

              <div className="table-data">
                <div className="order">
                  <div className="head">
                    <h3>Registered Delivery Boys</h3>
                  </div>

                  {ridersList.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem' }}>No riders registered.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>S.N.</th>
                          <th>Name / Contact</th>
                          <th>Email</th>
                          <th>Address</th>
                          <th>Aadhar ID</th>
                          <th>Verification</th>
                          <th>Role Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ridersList.map((rider, idx) => (
                          <tr key={rider.id}>
                            <td>{idx + 1}.</td>
                            <td style={{ textAlign: 'left' }}>
                              <strong>Name:</strong> {rider.name}<br />
                              <strong>Username:</strong> {rider.username}<br />
                              <strong>Mobile:</strong> {rider.mobile_number}
                            </td>
                            <td>{rider.email}</td>
                            <td>{rider.address}</td>
                            <td>
                              {rider.adhar_image ? (
                                <a href={`/uploads/${rider.adhar_image}`} target="_blank" rel="noreferrer">
                                  <img src={`/uploads/${rider.adhar_image}`} alt="Aadhar Card" style={{ width: '80px', borderRadius: '10px', border: '1px solid #ccc' }} onError={(e) => e.target.src = 'https://placehold.co/100x50'} />
                                </a>
                              ) : (
                                <span className="error">No Image</span>
                              )}
                            </td>
                            <td>
                              <span className={`status ${rider.status === 'verified' ? 'completed' : 'pending'}`}>
                                {rider.status === 'verified' ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td>
                              <span style={{ color: rider.user_role === 1 ? 'green' : 'red', fontWeight: 'bold' }}>
                                {rider.user_role === 1 ? 'Active' : 'Blocked'}
                              </span>
                            </td>
                            <td className="table-actions">
                              {rider.status !== 'verified' ? (
                                <button onClick={() => handleUpdateRiderStatus(rider.id, 'verified')} className="button-8" role="button">Verify</button>
                              ) : (
                                <button onClick={() => handleUpdateRiderStatus(rider.id, 'not_verified')} className="button-7" role="button">Revoke Verification</button>
                              )}
                              
                              {rider.user_role === 1 ? (
                                <button onClick={() => handleUpdateRiderRole(rider.id, 0)} className="button-5" role="button">Block</button>
                              ) : (
                                <button onClick={() => handleUpdateRiderRole(rider.id, 1)} className="button-5" role="button" style={{ background: '#22c55e' }}>Unblock</button>
                              )}
                              <button onClick={() => handleDeleteRider(rider.id)} className="button-7" role="button">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: RIDER PAYMENTS */}
          {activeTab === 'rider_payments' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>Payment History</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/manage-delivery-payment">Payment History</Link></li>
                  </ul>
                </div>
              </div>

              <div className="table-data">
                <div className="order">
                  <div className="head">
                    <h3>Delivery Boy Payments</h3>
                  </div>

                  {riderPaymentsList.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem' }}>No salary records available.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>S.N.</th>
                          <th>Delivery Boy Username</th>
                          <th>Salary Earned</th>
                          <th>Associated Order ID</th>
                          <th>Created At</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riderPaymentsList.map((pay, idx) => (
                          <tr key={pay.id}>
                            <td>{idx + 1}</td>
                            <td><strong>{pay.username}</strong></td>
                            <td>Rs {pay.salary}</td>
                            <td>#{pay.order_id}</td>
                            <td>{new Date(pay.created_at).toLocaleString()}</td>
                            <td>
                              <span className={`status ${pay.payment_status === 'paid' ? 'completed' : 'pending'}`} style={{ background: pay.payment_status === 'paid' ? '' : '#e69500' }}>
                                {pay.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                              </span>
                            </td>
                            <td className="table-actions">
                              {pay.payment_status !== 'paid' ? (
                                <button onClick={() => handleSettleRiderPayment(pay.id)} className="button-8" role="button" style={{ padding: '6px 12px', fontSize: '12px' }}>Settle Payment</button>
                              ) : (
                                <span className="status completed" style={{ background: '#22c55e' }}>Sattled</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: DISCOUNT COUPONS */}
          {activeTab === 'coupons' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>Discount Coupons</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/manage-coupons">Discount Coupons</Link></li>
                    {currentAction === 'add' && (
                      <>
                        <li><i className="bx bx-chevron-right"></i></li>
                        <li><span className="active">Add Coupon</span></li>
                      </>
                    )}
                    {currentAction === 'edit' && (
                      <>
                        <li><i className="bx bx-chevron-right"></i></li>
                        <li><span className="active">Update Coupon</span></li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {currentAction === 'list' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>Active Coupons</h3>
                      <button 
                        onClick={() => setCurrentAction('add')}
                        className="button-6"
                        role="button"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Plus size={16} />
                        <span>Add Coupon</span>
                      </button>
                    </div>

                    {couponsList.length === 0 ? (
                      <p style={{ color: '#64748b', padding: '1rem' }}>No discount coupons configured.</p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>S.N.</th>
                            <th>Coupon Name</th>
                            <th>Code</th>
                            <th>Discount (%)</th>
                            <th>Status</th>
                            <th>Created Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {couponsList.map((cpn, idx) => (
                            <tr key={cpn.id}>
                              <td>{idx + 1}.</td>
                              <td>{cpn.name}</td>
                              <td><span className="status process" style={{ fontWeight: 'bold', letterSpacing: '1px' }}>{cpn.coupon_code}</span></td>
                              <td>{cpn.discount_percentage || cpn.discount}%</td>
                              <td>
                                <span className={`status ${cpn.active === 'Yes' || cpn.status === 'active' ? 'completed' : 'pending'}`}>
                                  {cpn.active === 'Yes' || cpn.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>{cpn.created_date ? new Date(cpn.created_date).toLocaleDateString() : '-'}</td>
                              <td className="table-actions">
                                <button onClick={() => handleStartEditCoupon(cpn)} className="button-8" role="button">Update</button>
                                <button onClick={() => handleDeleteCoupon(cpn.id)} className="button-7" role="button">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {currentAction === 'add' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>Add Discount Coupon</h3>
                    </div>
                    <form onSubmit={handleAddCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Coupon Code</label>
                        <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="e.g. YUMMY30" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Discount Percentage (%)</label>
                        <input type="number" min="1" max="100" value={couponDiscount} onChange={(e) => setCouponDiscount(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select value={couponActive} onChange={(e) => setCouponActive(e.target.value)}>
                          <option value="Yes">Active</option>
                          <option value="No">Disabled</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" disabled={submitLoading} className="button-8" role="button">
                          {submitLoading ? 'Saving...' : 'Save Coupon'}
                        </button>
                        <button type="button" onClick={() => setCurrentAction('list')} className="button-5" role="button">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {currentAction === 'edit' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>Edit Discount Coupon</h3>
                    </div>
                    <form onSubmit={handleEditCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Coupon Code</label>
                        <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="e.g. YUMMY30" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Discount Percentage (%)</label>
                        <input type="number" min="1" max="100" value={couponDiscount} onChange={(e) => setCouponDiscount(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select value={couponActive} onChange={(e) => setCouponActive(e.target.value)}>
                          <option value="Yes">Active</option>
                          <option value="No">Disabled</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" disabled={submitLoading} className="button-8" role="button">
                          {submitLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => setCurrentAction('list')} className="button-5" role="button">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: FESTIVAL COUPONS */}
          {activeTab === 'fest_coupons' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>Festival Special Coupon</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/manage-fest-coupon">Festival Special Coupon</Link></li>
                    {currentAction === 'add' && (
                      <>
                        <li><i className="bx bx-chevron-right"></i></li>
                        <li><span className="active">Add Festival Coupon</span></li>
                      </>
                    )}
                    {currentAction === 'edit' && (
                      <>
                        <li><i className="bx bx-chevron-right"></i></li>
                        <li><span className="active">Update Festival Coupon</span></li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {currentAction === 'list' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>Festival Special Coupons</h3>
                      <button 
                        onClick={() => setCurrentAction('add')}
                        className="button-6"
                        role="button"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Plus size={16} />
                        <span>Add Festival Coupon</span>
                      </button>
                    </div>

                    {festCouponsList.length === 0 ? (
                      <p style={{ color: '#64748b', padding: '1rem' }}>No festival coupons configured.</p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>S.N.</th>
                            <th>Festival Name</th>
                            <th>Coupon Code</th>
                            <th>Discount</th>
                            <th>Duration (Days)</th>
                            <th>Expiry</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {festCouponsList.map((cpn, idx) => (
                            <tr key={cpn.id}>
                              <td>{idx + 1}.</td>
                              <td>{cpn.festival_name}</td>
                              <td><span className="status process" style={{ fontWeight: 'bold', letterSpacing: '0.05em' }}>{cpn.coupon_code}</span></td>
                              <td>{cpn.discount}% OFF</td>
                              <td>{cpn.duration} days</td>
                              <td>
                                <span className={`status ${cpn.expire === 'active' ? 'completed' : 'cancelled'}`}>
                                  {cpn.expire}
                                </span>
                              </td>
                              <td>
                                <span className={`status ${cpn.status === 'active' ? 'completed' : 'cancelled'}`}>
                                  {cpn.status}
                                </span>
                              </td>
                              <td className="table-actions">
                                <button onClick={() => handleStartEditFestCoupon(cpn)} className="button-8" role="button">Update</button>
                                <button onClick={() => handleDeleteFestCoupon(cpn.id)} className="button-7" role="button">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {currentAction === 'add' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>Add Festival Special Coupon</h3>
                    </div>
                    <form onSubmit={handleAddFestCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Festival Name</label>
                        <input type="text" value={festName} onChange={(e) => setFestName(e.target.value)} placeholder="e.g. Diwali Special" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Coupon Code</label>
                        <input type="text" value={festCode} onChange={(e) => setFestCode(e.target.value.toUpperCase())} placeholder="e.g. FESTIVAL50" required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Discount Percentage (%)</label>
                          <input type="number" min="1" max="100" value={festDiscount} onChange={(e) => setFestDiscount(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Duration (Days)</label>
                          <input type="number" min="1" value={festDuration} onChange={(e) => setFestDuration(e.target.value)} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select value={festStatus} onChange={(e) => setFestStatus(e.target.value)}>
                          <option value="active">Active</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" disabled={submitLoading} className="button-8" role="button">
                          {submitLoading ? 'Saving...' : 'Save Festival Coupon'}
                        </button>
                        <button type="button" onClick={resetFestForm} className="button-5" role="button">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {currentAction === 'edit' && (
                <div className="table-data">
                  <div className="order">
                    <div className="head">
                      <h3>Edit Festival Special Coupon</h3>
                    </div>
                    <form onSubmit={handleEditFestCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Festival Name</label>
                        <input type="text" value={festName} onChange={(e) => setFestName(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Coupon Code</label>
                        <input type="text" value={festCode} onChange={(e) => setFestCode(e.target.value.toUpperCase())} required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Discount Percentage (%)</label>
                          <input type="number" min="1" max="100" value={festDiscount} onChange={(e) => setFestDiscount(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Duration (Days)</label>
                          <input type="number" min="1" value={festDuration} onChange={(e) => setFestDuration(e.target.value)} required />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Status</label>
                          <select value={festStatus} onChange={(e) => setFestStatus(e.target.value)}>
                            <option value="active">Active</option>
                            <option value="disabled">Disabled</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Expire Status</label>
                          <select value={festExpire} onChange={(e) => setFestExpire(e.target.value)}>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" disabled={submitLoading} className="button-8" role="button">
                          {submitLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={resetFestForm} className="button-5" role="button">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: REPEAT RATES */}
          {activeTab === 'repeat_rates' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>Repeat Rates</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/manage-repeat-rate">Repeat Rates</Link></li>
                  </ul>
                </div>
              </div>

              <div className="table-data">
                <div className="order">
                  <div className="head" style={{ justifyContent: 'space-between' }}>
                    <h3>Customer Retention & Repeat Rates</h3>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '8px 16px', borderRadius: '12px', fontWeight: 800 }}>
                      <span>Platform Retention Average:</span>
                      <span style={{ fontSize: '1.2rem' }}>{totalRepeatRate}%</span>
                    </div>
                  </div>

                  {repeatRatesList.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem' }}>No order statistics available.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Customer Username</th>
                          <th>Completed Orders</th>
                          <th>Contribution Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {repeatRatesList.map((rate, idx) => (
                          <tr key={idx}>
                            <td><strong>{rate.username}</strong></td>
                            <td>{rate.count} checkouts</td>
                            <td><span style={{ color: '#fea116', fontWeight: 'bold' }}>{rate.rate}%</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: MONTHLY REVENUE */}
          {activeTab === 'revenue' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>Monthly Revenue</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/monthly-revenue">Monthly Revenue</Link></li>
                  </ul>
                </div>
              </div>

              <div className="summary-grid">
                <div className="summary-card">
                  <h3>Total Revenue (All time)</h3>
                  <p>Rs {allTimeTotal.toFixed(2)}</p>
                  <small>{allTimeOrders} total orders</small>
                </div>
                <div className="summary-card">
                  <h3>Last 12 Months</h3>
                  <p>Rs {last12Total.toFixed(2)}</p>
                  <small>{last12Orders} total orders</small>
                </div>
                <div className="summary-card">
                  <h3>This Month</h3>
                  <p>Rs {last12Total > 0 ? (revenueList[revenueList.length - 1]?.total || 0).toFixed(2) : '0.00'}</p>
                  <small>{last12Total > 0 ? (revenueList[revenueList.length - 1]?.orders || 0) : 0} orders</small>
                </div>
                <div className="summary-card">
                  <h3>Average / Month</h3>
                  <p>Rs {averageMonthly.toFixed(2)}</p>
                  <small>Based on last 12 months</small>
                </div>
              </div>

              <div className="chart-panel">
                <div className="panel-head">
                  <h3>Monthly Revenue</h3>
                  <span className="panel-chip">Last 12 months</span>
                </div>
                <div className="chart revenue-chart" id="monthly_revenue_chart" style={{ minHeight: '360px' }}></div>
              </div>
              
              <div className="chart-panel">
                <div className="panel-head">
                  <h3>Total Revenue By Month</h3>
                  <span className="panel-chip">All time</span>
                </div>
                <div className="chart revenue-chart" id="all_time_revenue_chart" style={{ minHeight: '360px' }}></div>
              </div>

              <div className="table-data">
                <div className="order">
                  <table>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Total Revenue</th>
                        <th>Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueList.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.label || row.month}</td>
                          <td>Rs {(row.total || row.total_revenue || 0).toFixed(2)}</td>
                          <td>{row.orders || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REVIEWS LOG */}
          {activeTab === 'reviews' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>Reviews</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/manage-review">Reviews</Link></li>
                  </ul>
                </div>
              </div>

              <div className="table-data">
                <div className="order">
                  <div className="head" style={{ justifyContent: 'space-between' }}>
                    <h3>Platform Review Logs</h3>
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', padding: '2px' }}>
                      <button 
                        onClick={() => setReviewType('order')}
                        style={{ border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s', background: reviewType === 'order' ? '#fff' : 'transparent', color: reviewType === 'order' ? '#0f172a' : '#64748b', boxShadow: reviewType === 'order' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                      >
                        Order Reviews
                      </button>
                      <button 
                        onClick={() => setReviewType('kitchen')}
                        style={{ border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s', background: reviewType === 'kitchen' ? '#fff' : 'transparent', color: reviewType === 'kitchen' ? '#0f172a' : '#64748b', boxShadow: reviewType === 'kitchen' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                      >
                        Kitchen Reviews
                      </button>
                    </div>
                  </div>

                  {((reviewType === 'order' ? reviewsList.order : reviewsList.kitchen) || []).length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem' }}>No reviews recorded under this category.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                      {((reviewType === 'order' ? reviewsList.order : reviewsList.kitchen) || []).map((rev) => (
                        <div key={rev.id} style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
                          <div style={{ display: 'flex', justify: 'space-between', marginBottom: '8px' }}>
                            <div style={{ fontWeight: 'bold' }}>{rev.name || rev.username || 'Customer'}</div>
                            <div style={{ color: '#fea116', fontWeight: 'bold' }}>{rev.review_star || rev.rating_star} / 5 ★</div>
                          </div>
                          <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>{rev.review_message || rev.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: INBOX MESSAGES */}
          {activeTab === 'messages' && (
            <div>
              <div className="head-title">
                <div className="left">
                  <h1>Inquiries</h1>
                  <ul className="breadcrumb">
                    <li><Link to="/admin/" className="clickable">Dashboard</Link></li>
                    <li><i className="bx bx-chevron-right"></i></li>
                    <li><Link className="active" to="/admin/messages">Inquiries</Link></li>
                  </ul>
                </div>
              </div>

              <div className="table-data">
                <div className="order">
                  <div className="head">
                    <h3>Support Inquiries Inbox</h3>
                  </div>

                  {messagesList.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem' }}>No inquiries received.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                      {messagesList.map((msg) => (
                        <div key={msg.id} style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', justify: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{msg.full_name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>From: {msg.email} | Phone: {msg.contact}</div>
                            <p style={{ margin: '8px 0 0 0', color: '#475569', fontSize: '0.9rem' }}>{msg.message}</p>
                          </div>
                          <button onClick={() => handleDeleteMessage(msg.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}><Trash2 size={18} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
