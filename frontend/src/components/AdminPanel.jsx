import { approvedBrandAssets } from '../assets/brandAssets';
import './admin-workspace.css';
import { filterOrdersByPeriod, overviewSeries, summarizeCategories, summarizeInventory } from '../lib/adminOverview';
import { OrderShippingEditor } from './OrderShippingEditor';
import { ProductImage } from './ProductImage';
import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  ClipboardList,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Search,
  Bell,
  ExternalLink,
  LogOut,
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  Calendar,
  TrendingUp,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Eye,
  SlidersHorizontal,
  FileSpreadsheet,
  Activity,
  Sparkles,
  Layers,
  Upload
} from 'lucide-react';

// Dot activo animado con onda expansiva tipo radar de alta gama
const CustomActiveDot = (props) => {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill="var(--bf-text)" fillOpacity={0.16} className="chart-pulse-ring" />
      <circle cx={cx} cy={cy} r={6.5} fill="var(--bf-text)" stroke="var(--bf-text)" strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={2.5} fill="var(--bf-text)" />
    </g>
  );
};

// Tooltip flotante de lujo con vidrio esmerilado y desglose en vivo
const CustomChartTooltip = ({ active, payload, label, formatMoney, chartViewMode }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const val = payload[0].value;

    return (
      <div className="chart-tooltip-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--bf-muted)', fontWeight: '600' }}>
            {data.fullDate || label}
          </span>
          <span className="chart-pulse-badge" />
        </div>

        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--bf-text)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          {chartViewMode.startsWith('revenue')
            ? formatMoney(val)
            : `${val} ${val === 1 ? 'pedido' : 'pedidos'}`
          }
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.73rem', color: 'var(--bf-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Pedidos en la fecha:</span>
            <strong style={{ color: 'var(--bf-text)' }}>{data.orders}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Prendas vendidas:</span>
            <strong style={{ color: 'var(--bf-text)' }}>{data.units} uds</strong>
          </div>
          {chartViewMode === 'revenue_accum' && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Venta en el día:</span>
              <strong style={{ color: '#4ADE80' }}>{formatMoney(data.revenue)}</strong>
            </div>
          )}
          {chartViewMode === 'orders' && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Facturado:</span>
              <strong style={{ color: '#4ADE80' }}>{formatMoney(data.revenue)}</strong>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const AdminPanel = ({ setActivePage }) => {
  const { user, logout } = useAuth();
  const {
    products,
    loadingProducts,
    orders,
    loadingOrders,
    fetchOrders,
    updateOrderStatus,
    restockProduct,
    createNewProduct,
    updateProduct,
    deleteProduct,
    formatMoney,
    showToast
  } = useCart();

  // Navegación de secciones
  // 'dashboard' | 'products' | 'inventory' | 'orders' | 'customers' | 'sales' | 'reports' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openNavGroups, setOpenNavGroups] = useState({ catalog: true, ordersGroup: false });

  // Filtros globales y por sección
  const [overviewCalendar, setOverviewCalendar] = useState(null);
  const [periodFilter, setPeriodFilter] = useState('30days'); // 'today' | '7days' | '30days' | 'month'
  const [chartViewMode, setChartViewMode] = useState('revenue_accum'); // 'revenue_accum' | 'revenue_daily' | 'orders'
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'
  const [globalSearch, setGlobalSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Estado para Módulo de Pedidos
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('Todos');
  const [orderSortOrder, setOrderSortOrder] = useState('desc'); // 'desc' | 'asc'
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPerPage = 8;

  // Estado para Módulo de Productos & Catálogo
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('Todas');
  const [productStockFilter, setProductStockFilter] = useState('Todos');
  const [productViewMode, setProductViewMode] = useState('table'); // 'table' | 'cards'
  const [productsPage, setProductsPage] = useState(1);
  const productsPerPage = 10;
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);

  // Formularios de producto
  const DEFAULT_VARIANTS = [
    { id: 'size-s', size: 'S', stock: 0 },
    { id: 'size-m', size: 'M', stock: 0 },
    { id: 'size-l', size: 'L', stock: 0 },
    { id: 'size-xl', size: 'XL', stock: 0 }
  ];
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    subcategory: '',
    category: 'Camisetas',
    price: '',
    previousPrice: '',
    colors: '',
    commercial: true,
    variantsList: DEFAULT_VARIANTS,
    description: '',
    image: '/Productos/jordan_Blanca.png'
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Estado para Módulo de Clientes
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customersPage, setCustomersPage] = useState(1);
  const customersPerPage = 10;

  // Reabastecimiento y control de bodega
  const [customRestockInputs, setCustomRestockInputs] = useState({});
  const [restockVariants, setRestockVariants] = useState({});
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('all'); // 'all' | 'attention' | 'out' | 'ok'
  const [inventoryPage, setInventoryPage] = useState(1);
  const inventoryPerPage = 10;

  // Tooltip en gráfica
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);

  // Umbral configurable de alerta de stock bajo
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  // Nota para historial de seguimiento del pedido
  const [orderTrackingNote, setOrderTrackingNote] = useState('');

  // Carga inicial y refresco de pedidos y clientes
  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, [fetchOrders]);

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.customers) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // ==============================================================
  // CÁLCULOS FINANCIEROS Y DE NEGOCIO (CON DATOS REALES)
  // ==============================================================
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // Filtrado de pedidos según el período seleccionado
  const periodOrders = useMemo(() => filterOrdersByPeriod(orders, periodFilter), [orders, periodFilter]);
  const periodValidOrders = useMemo(() => periodOrders.filter(o => o.orderStatus !== 'Cancelado'), [periodOrders]);
  const periodCancelledOrders = useMemo(() => periodOrders.filter(o => o.orderStatus === 'Cancelado'), [periodOrders]);

  // Distinción estricta de ingresos: no sumar pedidos cancelados a ventas válidas
  const validOrders = useMemo(() => orders.filter(o => o.orderStatus !== 'Cancelado'), [orders]);
  const cancelledOrders = useMemo(() => orders.filter(o => o.orderStatus === 'Cancelado'), [orders]);
  const pendingOrders = useMemo(() => orders.filter(o => ['En proceso', 'Pendiente', 'Aceptado'].includes(o.orderStatus)), [orders]);
  const deliveredOrders = useMemo(() => orders.filter(o => o.orderStatus === 'Entregado'), [orders]);

  // Métricas financieras globales y por período
  const totalNetRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const periodGrossRevenue = periodOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const periodNetRevenue = periodValidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const periodCancelledRevenue = periodCancelledOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const periodAverageOrderValue = periodValidOrders.length > 0 ? Math.round(periodNetRevenue / periodValidOrders.length) : 0;

  // Métricas de inventario agrupadas por prenda y talla
  const inventorySummary = useMemo(
    () => summarizeInventory(products, lowStockThreshold),
    [products, lowStockThreshold]
  );
  const filteredInventoryRows = useMemo(() => {
    const q = inventorySearch.toLowerCase().trim();
    return inventorySummary.rows.filter(({ product, status }) => {
      const matchesSearch = !q ||
        (product.name || '').toLowerCase().includes(q) ||
        (product.brand || '').toLowerCase().includes(q) ||
        (product.category || '').toLowerCase().includes(q) ||
        (product.sku || `SAUZ-${product.id}`).toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (inventoryFilter === 'attention') return status === 'out' || status === 'low';
      if (inventoryFilter === 'out') return status === 'out';
      if (inventoryFilter === 'ok') return status === 'ok';
      return true;
    });
  }, [inventorySummary, inventorySearch, inventoryFilter]);
  const totalInventoryPages = Math.ceil(filteredInventoryRows.length / inventoryPerPage) || 1;
  const paginatedInventoryRows = filteredInventoryRows.slice(
    (inventoryPage - 1) * inventoryPerPage,
    inventoryPage * inventoryPerPage
  );

  // Categorías dinámicas y resumen de rendimiento por categoría
  const productCategories = useMemo(
    () => ['Todas', ...new Set(products.map(p => p.category).filter(Boolean))],
    [products]
  );
  const categorySummary = useMemo(() => summarizeCategories(products, validOrders), [products, validOrders]);

  // Ranking de prendas más vendidas
  const topProducts = useMemo(() => {
    const map = {};
    validOrders.forEach(o => {
      (o.items || []).forEach(item => {
        if (!map[item.productId]) {
          map[item.productId] = {
            id: item.productId,
            name: item.name,
            image: item.image,
            quantity: 0,
            revenue: 0
          };
        }
        map[item.productId].quantity += item.quantity;
        map[item.productId].revenue += item.price * item.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [validOrders]);

  const chartData = useMemo(() => overviewSeries(orders, periodFilter, new Date(), overviewCalendar), [orders, periodFilter, overviewCalendar]);
  const overviewRevenue = chartData.reduce((sum, point) => sum + point.revenue, 0);
  const overviewCount = chartData.reduce((sum, point) => sum + point.orders, 0);
  const overviewUnits = chartData.reduce((sum, point) => sum + point.units, 0);
  const overviewAverage = overviewCount ? Math.round(overviewRevenue / overviewCount) : 0;
  const quickPeriodLabel = {today:'Hoy', '7days':'Últimos 7 días', '30days':'Últimos 30 días', month:'Este mes'}[periodFilter];
  const overviewPeriod = overviewCalendar ? `${overviewCalendar.month === 'all' ? 'Todo el año' : new Date(Number(overviewCalendar.year),Number(overviewCalendar.month),1).toLocaleDateString('es-CO',{month:'long'})} ${overviewCalendar.year}` : quickPeriodLabel;
  const overviewYears = [...new Set([new Date().getFullYear(), ...orders.map(order => new Date(Number(order.timestamp)).getFullYear()).filter(Number.isFinite)])].sort((a,b)=>b-a);

  // ==============================================================
  // ACCIONES DE PRODUCTO (CREAR / EDITAR / ELIMINAR / REABASTECER)
  // ==============================================================
  const handleOpenCreateProduct = () => {
    setProductForm({
      name: '',
      brand: '',
      subcategory: '',
      category: 'Camisetas',
      price: '',
      previousPrice: '',
      colors: '',
      commercial: true,
      variantsList: DEFAULT_VARIANTS.map(v => ({ ...v })),
      description: '',
      image: '/Productos/jordan_Blanca.png'
    });
    setEditingProduct(null);
    setIsCreateProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    const initialVariants = Array.isArray(prod.variants) && prod.variants.length > 0
      ? prod.variants.map((variant, idx) => ({
          id: variant.id || `size-${idx + 1}`,
          size: variant.size || '',
          stock: Number(variant.stock || 0)
        }))
      : [{ id: 'size-unica', size: 'Única', stock: Number(prod.stock || 0) }];

    setProductForm({
      name: prod.name || '',
      brand: prod.brand || '',
      subcategory: prod.subcategory || '',
      category: prod.category || 'Camisetas',
      price: prod.price ?? '',
      previousPrice: prod.previousPrice ?? '',
      colors: Array.isArray(prod.colors) ? prod.colors.join(', ') : '',
      commercial: prod.commercial !== false,
      variantsList: initialVariants,
      description: prod.description || '',
      image: prod.image || '/Productos/jordan_Blanca.png'
    });
    setIsCreateProductModalOpen(true);
  };

  const handleProductImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpeg|jpg|webp|avif)$/i.test(file.type)) {
      showToast('Selecciona una imagen PNG, JPG, WEBP o AVIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen supera el límite de 5 MB.');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/products/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            dataUrl: reader.result
          })
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error || 'No se pudo subir la imagen');
        }
        setProductForm(prev => ({ ...prev, image: data.url }));
        showToast('Imagen adjuntada correctamente');
      } catch (err) {
        showToast(err.message || 'Error al subir la imagen');
      } finally {
        setUploadingImage(false);
        event.target.value = '';
      }
    };
    reader.onerror = () => {
      setUploadingImage(false);
      showToast('No se pudo leer el archivo seleccionado');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      showToast('El nombre de la prenda es obligatorio');
      return;
    }

    const variants = (productForm.variantsList || []).map((row) => {
      const size = String(row.size || '').trim();
      const stock = Number(row.stock === '' ? 0 : row.stock);
      const previous = editingProduct?.variants?.find(v => v.size.toLowerCase() === size.toLowerCase());
      return {
        id: previous?.id || row.id || `size-${size.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        size,
        stock
      };
    });

    if (
      variants.length === 0 ||
      variants.some(variant => !variant.size || !Number.isInteger(variant.stock) || variant.stock < 0) ||
      new Set(variants.map(variant => variant.size.toLowerCase())).size !== variants.length
    ) {
      showToast('Agrega al menos una talla válida sin duplicados y con stock entero.');
      return;
    }

    const parsedColors = String(productForm.colors || '')
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const parsedPrice = productForm.price === '' || productForm.price == null ? null : parseFloat(productForm.price);
    const parsedPrevPrice = productForm.previousPrice === '' || productForm.previousPrice == null ? null : parseFloat(productForm.previousPrice);

    try {
      const payload = {
        name: productForm.name.trim(),
        brand: String(productForm.brand || '').trim(),
        subcategory: String(productForm.subcategory || '').trim(),
        sizes: variants.map(v => v.size),
        variants,
        category: productForm.category,
        price: parsedPrice,
        previousPrice: parsedPrevPrice,
        colors: parsedColors,
        commercial: Boolean(productForm.commercial),
        stock: totalStock,
        description: String(productForm.description || '').trim(),
        image: productForm.image
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createNewProduct(payload);
      }
      setIsCreateProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      // Manejado en el contexto
    }
  };

  const handleExecuteDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    try {
      await deleteProduct(deleteConfirmProduct.id);
      setDeleteConfirmProduct(null);
    } catch (err) {
      // Manejado en el contexto
    }
  };

  const handleQuickRestock = async (productId, amount, variantId) => {
    const qty = parseInt(amount, 10);
    if (!qty || qty <= 0) return;
    const product = products.find(item => item.id === productId);
    await restockProduct(productId, qty, variantId || restockVariants[productId] || product?.variants?.[0]?.id);
    setCustomRestockInputs(prev => ({ ...prev, [productId]: '' }));
  };

  // ==============================================================
  // EXPORTACIÓN A CSV PROFESIONAL
  // ==============================================================
  const exportOrdersToCSV = () => {
    if (orders.length === 0) {
      showToast('No existen pedidos para exportar.');
      return;
    }

    const headers = ['ID Orden', 'Fecha', 'Cliente', 'Email', 'Telefono', 'Ciudad', 'Direccion', 'Metodo Pago', 'Estado Pago', 'Estado Orden', 'Articulos', 'Total COP'];
    const rows = orders.map(o => [
      `"${o.orderId}"`,
      `"${o.date}"`,
      `"${o.customer?.name || ''}"`,
      `"${o.customer?.email || ''}"`,
      `"${o.customer?.phone || ''}"`,
      `"${o.customer?.city || ''}"`,
      `"${(o.customer?.address || '').replace(/"/g, '""')}"`,
      `"${o.payment?.method || ''}"`,
      `"${o.payment?.status || ''}"`,
      `"${o.orderStatus || 'En proceso'}"`,
      o.count || (o.items || []).length,
      o.total || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sauz_store_pedidos_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo CSV de pedidos descargado con éxito');
  };

  const exportInventoryToCSV = () => {
    if (products.length === 0) {
      showToast('No existen prendas registradas en inventario.');
      return;
    }

    const headers = ['ID', 'Nombre', 'Categoria', 'Precio COP', 'Existencias', 'Estado', 'Descripcion'];
    const rows = products.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.price,
      p.stock,
      `"${p.stock === 0 ? 'Agotado' : (p.stock <= 5 ? 'Bajo stock' : 'Disponible')}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sauz_store_inventario_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo CSV de inventario descargado con éxito');
  };

  // ==============================================================
  // FILTRADO Y PAGINACIÓN DE PEDIDOS, PRODUCTOS Y CLIENTES
  // ==============================================================
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = orderSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        (o.orderId || '').toString().toLowerCase().includes(q) ||
        (o.customer?.name || '').toLowerCase().includes(q) ||
        (o.customer?.email || '').toLowerCase().includes(q) ||
        (o.customer?.city || '').toLowerCase().includes(q);

      const status = o.orderStatus || 'En proceso';
      const matchesStatus = orderStatusFilter === 'Todos'
        ? true
        : orderStatusFilter === 'Por gestionar'
          ? ['Pendiente', 'Aceptado', 'En proceso'].includes(status)
          : status.toLowerCase() === orderStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const timeA = a.timestamp || 0;
      const timeB = b.timestamp || 0;
      return orderSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [orders, orderSearch, orderStatusFilter, orderSortOrder]);

  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage);

  // Filtrado de Productos
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = productSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.sku || `sku-${p.id}`).toLowerCase().includes(q);

      const matchesCategory = productCategoryFilter === 'Todas' || p.category === productCategoryFilter;

      let matchesStock = true;
      if (productStockFilter === 'in_stock') matchesStock = p.stock > 5;
      if (productStockFilter === 'low_stock') matchesStock = p.stock > 0 && p.stock <= 5;
      if (productStockFilter === 'out_of_stock') matchesStock = p.stock === 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, productSearch, productCategoryFilter, productStockFilter]);

  const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((productsPage - 1) * productsPerPage, productsPage * productsPerPage);

  // Filtrado de Clientes
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = customerSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.city || '').toLowerCase().includes(q)
      );
    });
  }, [customers, customerSearch]);

  const totalCustomerPages = Math.ceil(filteredCustomers.length / customersPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice((customersPage - 1) * customersPerPage, customersPage * customersPerPage);

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(null, '', '/');
    }
    setActivePage('home');
  };

  const handleGoToStore = () => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(null, '', '/');
    }
    setActivePage('home');
  };

  // Helper para insignias de estado de pedido
  const renderOrderStatusBadge = (status) => {
    const st = status || 'En proceso';
    let tone = 'is-neutral';
    let Icon = Clock;

    if (st === 'Entregado') {
      tone = 'is-success';
      Icon = PackageCheck;
    } else if (st === 'Enviado') {
      tone = 'is-info';
      Icon = Truck;
    } else if (st === 'Aceptado') {
      tone = 'is-neutral';
      Icon = CheckCircle2;
    } else if (st === 'En proceso') {
      tone = 'is-warning';
      Icon = Clock;
    } else if (st === 'Cancelado') {
      tone = 'is-danger';
      Icon = XCircle;
    }

    return (
      <span className={`admin-status-pill ${tone}`}>
        <Icon size={12} strokeWidth={2} aria-hidden="true" />
        <span>{st}</span>
      </span>
    );
  };

  // Helper para insignias de stock
  const renderStockBadge = (stock) => {
    if (stock === 0) {
      return (
        <span className="admin-status-pill is-danger">
          <AlertCircle size={12} aria-hidden="true" />
          <span>Agotado (0)</span>
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="admin-status-pill is-warning">
          <Clock size={12} aria-hidden="true" />
          <span>Bajo ({stock})</span>
        </span>
      );
    }
    return (
      <span className="admin-status-pill is-success">
        <CheckCircle2 size={12} aria-hidden="true" />
        <span>{stock} uds</span>
      </span>
    );
  };

  const sidebarIsCollapsed = sidebarCollapsed && !mobileMenuOpen;

  return (
    <div
      className="sauz-admin-workspace"
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bf-surface)',
        color: 'var(--bf-text)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* ==============================================================
          BARRA LATERAL / SIDEBAR LIMPIO SAUZ BLACK
          ============================================================== */}
      {mobileMenuOpen && (
        <div
          className="admin-sidebar-backdrop"
          aria-hidden="true"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside
        style={{
          width: sidebarIsCollapsed ? '78px' : '284px',
          backgroundColor: 'var(--bf-secondary)',
          borderRight: '1px solid var(--bf-border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          flexShrink: 0
        }}
        data-collapsed={sidebarIsCollapsed && !mobileMenuOpen}
        className={`admin-sidebar ${mobileMenuOpen ? 'admin-sidebar-mobile-open' : 'admin-sidebar-desktop'}`}
      >
        <div className="admin-sidebar-content">
          <div className="admin-sidebar-brand">
            {!sidebarIsCollapsed ? (
              <div className="admin-sidebar-identity">
                <img src={approvedBrandAssets.SAUZ.src} alt="SAUZ Store" width="64" height="37" />
                <span>Administración</span>
              </div>
            ) : (
              <span className="admin-sidebar-monogram">S.</span>
            )}
          </div>

          {/* Menú de Navegación */}
          <nav aria-label="Administración de la tienda" className="admin-sidebar-nav" style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              {
                id: 'catalog',
                label: 'Catálogo',
                icon: ShoppingBag,
                children: [
                  { id: 'products', label: 'Productos', count: products.length },
                  { id: 'inventory', label: 'Inventario', count: (inventorySummary.lowProductCount + inventorySummary.outProductCount) > 0 ? (inventorySummary.lowProductCount + inventorySummary.outProductCount) : null }
                ]
              },
              {
                id: 'ordersGroup',
                label: 'Pedidos',
                icon: ClipboardList,
                children: [
                  { id: 'orders', label: 'Todos los pedidos', filter: 'Todos' },
                  { id: 'orders-pending', tab: 'orders', label: 'Pendientes', filter: 'Por gestionar', count: pendingOrders.length > 0 ? pendingOrders.length : null }
                ]
              },
              { id: 'customers', label: 'Clientes', icon: Users },
              { id: 'sales', label: 'Ventas', icon: TrendingUp },
              { id: 'reports', label: 'Reportes', icon: BarChart3 },
              { id: 'settings', label: 'Configuración', icon: Settings }
            ].map((item) => {
              const Icon = item.icon;
              if (item.children) {
                const isGroupActive = item.id === 'catalog'
                  ? (activeTab === 'products' || activeTab === 'inventory')
                  : activeTab === 'orders';
                const isOpen = !sidebarIsCollapsed && Boolean(openNavGroups[item.id]);
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (sidebarIsCollapsed) {
                          setSidebarCollapsed(false);
                          setOpenNavGroups(prev => ({ ...prev, [item.id]: true }));
                          setActiveTab(item.id === 'catalog' ? 'products' : 'orders');
                        } else {
                          setOpenNavGroups(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                        }
                      }}
                      title={sidebarIsCollapsed ? item.label : undefined}
                      aria-expanded={isOpen}
                      className={`admin-nav-item ${isGroupActive && !isOpen ? 'active' : ''}`}
                    >
                      <span className="admin-nav-main">
                        <span className="admin-nav-icon"><Icon size={20} strokeWidth={1.8} /></span>
                        {!sidebarIsCollapsed && <span className="admin-nav-label">{item.label}</span>}
                      </span>
                      {!sidebarIsCollapsed && (
                        <ChevronDown size={17} className={`admin-nav-chevron ${isOpen ? 'is-open' : ''}`} aria-hidden="true" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="admin-nav-submenu">
                        {item.children.map((child) => {
                          const targetTab = child.tab || child.id;
                          const isChildActive = child.id === 'orders-pending'
                            ? activeTab === 'orders' && orderStatusFilter === 'Por gestionar'
                            : child.id === 'orders'
                              ? activeTab === 'orders' && orderStatusFilter !== 'Por gestionar'
                              : activeTab === targetTab;
                          return (
                            <button
                              key={child.id}
                              type="button"
                              aria-current={isChildActive ? 'page' : undefined}
                              className={`admin-nav-subitem ${isChildActive ? 'active' : ''}`}
                              onClick={() => {
                                if (child.filter) {
                                  setOrderStatusFilter(child.filter);
                                  setOrdersPage(1);
                                }
                                setActiveTab(targetTab);
                                setMobileMenuOpen(false);
                              }}
                            >
                              <span>{child.label}</span>
                              {child.count !== null && child.count !== undefined && (
                                <span className="admin-nav-count">{child.count}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  title={sidebarIsCollapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="admin-nav-main">
                    <span className="admin-nav-icon"><Icon size={20} strokeWidth={1.8} /></span>
                    {!sidebarIsCollapsed && <span className="admin-nav-label">{item.label}</span>}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Zona Inferior: Ver tienda y Cierre de Sesión */}
        <div className="admin-sidebar-footer">
          <button
            type="button"
            onClick={handleGoToStore}
            className="admin-sidebar-action"
            aria-label="Ir a la tienda"
            title={sidebarIsCollapsed ? 'Ver tienda' : undefined}
          >
            <ExternalLink size={20} strokeWidth={1.8} aria-hidden="true" />
            {!sidebarIsCollapsed && <span>Ver tienda</span>}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="admin-sidebar-action is-logout"
            aria-label="Cerrar sesión"
            title={sidebarIsCollapsed ? 'Cerrar sesión' : undefined}
          >
            <LogOut size={20} strokeWidth={1.8} aria-hidden="true" />
            {!sidebarIsCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* ==============================================================
          ÁREA PRINCIPAL DE TRABAJO (CABECERA + CONTENIDO)
          ============================================================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Cabecera Superior Corporativa */}
        <header className="admin-topbar"
          style={{
            height: '68px',
            backgroundColor: 'var(--bf-secondary)',
            borderBottom: '1px solid var(--bf-border)',
            padding: '0 clamp(16px, 3vw, 36px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
        >
          {/* Izquierda: Toggle móvil y Título con Migas de Pan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={() => window.innerWidth <= 900 ? setMobileMenuOpen(!mobileMenuOpen) : setSidebarCollapsed(!sidebarCollapsed)}
              aria-label="Abrir o cerrar menú de administración"
              aria-expanded={window.innerWidth <= 900 ? mobileMenuOpen : !sidebarCollapsed}
              className="admin-mobile-toggle-btn"
              style={{
                background: 'none',
                border: '1px solid var(--bf-border)',
                borderRadius: '6px',
                padding: '6px',
                color: 'var(--bf-text)',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Menu size={18} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--bf-muted)' }}>
                <span>Administración</span>
                <span>/</span>
                <span style={{ textTransform: 'capitalize', color: 'var(--bf-text)', fontWeight: '600' }}>
                  {activeTab === 'dashboard' && 'Resumen'}
                  {activeTab === 'products' && 'Productos'}
                  {activeTab === 'inventory' && 'Inventario'}
                  {activeTab === 'orders' && 'Pedidos'}
                  {activeTab === 'customers' && 'Clientes'}
                  {activeTab === 'sales' && 'Ventas'}
                  {activeTab === 'reports' && 'Reportes'}
                  {activeTab === 'settings' && 'Configuración'}
                </span>
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '2px 0 0 0', letterSpacing: '-0.02em', color: 'var(--bf-text)' }}>
                {activeTab === 'dashboard' && 'Tu tienda, de un vistazo'}
                {activeTab === 'products' && 'Catálogo de Prendas'}
                {activeTab === 'inventory' && 'Inventario y Existencias'}
                {activeTab === 'orders' && 'Gestión de Pedidos'}
                {activeTab === 'customers' && 'Directorio de Clientes'}
                {activeTab === 'sales' && 'Analítica Financiera'}
                {activeTab === 'reports' && 'Reportes y Exportación'}
                {activeTab === 'settings' && 'Ajustes de la Tienda'}
              </h2>
            </div>
          </div>

          {/* Derecha: Selector de período, Notificaciones y Acciones */}
          <div className="admin-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Controles de período para métricas financieras */}
            {(activeTab === 'sales' || activeTab === 'reports') && (
              <div className="admin-period-controls" style={{ display: 'flex', backgroundColor: '#101010', border: '1px solid #303030' }}>
                {[
                  { id: 'today', label: 'Hoy' },
                  { id: '7days', label: '7 días' },
                  { id: '30days', label: '30 días' },
                  { id: 'month', label: 'Este mes' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={periodFilter === p.id}
                    onClick={() => setPeriodFilter(p.id)}
                    style={{
                      padding: '6px 13px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#a6a6a6',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            <div className="admin-topbar-user"><span><strong>{user?.name || 'Administrador'}</strong><small>Administración SAUZ</small></span><span className="admin-topbar-avatar">{user?.name?.charAt(0).toUpperCase() || 'A'}</span></div>

            {/* Menú de Notificaciones */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notificaciones"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid var(--bf-border)',
                  backgroundColor: '#1b1b1b',
                  color: 'var(--bf-text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Bell size={17} />
                {pendingOrders.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#ff1724',
                      borderRadius: '50%'
                    }}
                  />
                )}
              </button>

              {notificationsOpen && (
                <div className="admin-notifications-popover">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bf-text)' }}>Notificaciones operativas</span>
                    <button
                      type="button"
                      className="admin-modal-close"
                      style={{ width: '28px', height: '28px' }}
                      aria-label="Cerrar notificaciones"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {pendingOrders.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--bf-muted)' }}>No hay pedidos pendientes de despacho.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '600' }}>
                        {pendingOrders.length} {pendingOrders.length === 1 ? 'pedido requiere' : 'pedidos requieren'} atención:
                      </span>
                      {pendingOrders.slice(0, 3).map(po => (
                        <div
                          key={po.orderId}
                          className="admin-notification-item"
                          onClick={() => {
                            setSelectedOrderDetails(po);
                            setNotificationsOpen(false);
                            setActiveTab('orders');
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <strong style={{ color: 'var(--bf-text)' }}>{po.orderId}</strong>
                            <span className="admin-tabular" style={{ color: 'var(--bf-muted)' }}>{formatMoney(po.total)}</span>
                          </div>
                          <span style={{ color: 'var(--bf-muted)', display: 'block', fontSize: '11px', marginTop: '3px' }}>{po.customer?.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ==============================================================
            CONTENEDOR DE PÁGINA (SEGÚN activeTab)
            ============================================================== */}
        <main className="admin-main" style={{ padding: 'clamp(20px, 3.5vw, 40px)', flex: 1 }}>
          {/* ==============================================================
              VISTA 1: DASHBOARD (RESUMEN EJECUTIVO & INDICADORES FINANCIEROS)
              ============================================================== */}
          {activeTab === 'dashboard' && (
            <div className="admin-view-animated admin-overview" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <section className="admin-welcome admin-report-heading" aria-labelledby="admin-welcome-title">
                <div><span className="admin-eyebrow">SAUZ / CENTRO DE CONTROL</span><h1 id="admin-welcome-title">RESUMEN DE TU TIENDA.</h1><p>Ventas, pedidos e inventario en un solo lugar.</p></div>
                <button type="button" className="admin-primary-action" onClick={handleOpenCreateProduct}><Plus size={17} /> Nuevo producto</button>
              </section>
              <section className="admin-date-panel" aria-labelledby="admin-date-title">
                <div className="admin-date-heading"><span className="admin-task-icon"><Calendar size={20} aria-hidden="true" /></span><div><h2 id="admin-date-title">Selecciona el período</h2><p>Las cifras y la gráfica se actualizan con tu selección.</p></div><span className="admin-date-current" role="status">{overviewPeriod}</span></div>
                <div className="admin-date-fields">
                  <label>Año<select aria-label="Año de consulta" value={overviewCalendar?.year || ''} onChange={e=>setOverviewCalendar(e.target.value ? {year:e.target.value,month:overviewCalendar?.month || 'all'} : null)}><option value="">Rango rápido</option>{overviewYears.map(year=><option key={year} value={year}>{year}</option>)}</select></label>
                  <label>Mes<select aria-label="Mes de consulta" value={overviewCalendar?.month || 'all'} disabled={!overviewCalendar} onChange={e=>setOverviewCalendar({...overviewCalendar,month:e.target.value})}><option value="all">Todos los meses</option>{Array.from({length:12},(_,month)=><option key={month} value={month}>{new Date(2026,month,1).toLocaleDateString('es-CO',{month:'long'})}</option>)}</select></label>
                  <div className="admin-date-quick"><span>Acceso rápido</span><div className="admin-period-controls">{[{id:'today',label:'Hoy'},{id:'7days',label:'7 días'},{id:'30days',label:'30 días'},{id:'month',label:'Este mes'}].map(period=><button key={period.id} type="button" aria-pressed={!overviewCalendar && periodFilter===period.id} onClick={()=>{setOverviewCalendar(null);setPeriodFilter(period.id);}}>{period.label}</button>)}</div></div>
                  <button className="admin-date-reset" type="button" onClick={()=>{setOverviewCalendar(null);setPeriodFilter('30days');}}><RefreshCw size={15} aria-hidden="true" /> Restablecer</button>
                </div>
              </section>
              <section aria-labelledby="admin-metrics-title">
                <div className="admin-section-label"><h2 id="admin-metrics-title">Ventas del período</h2><span>{overviewPeriod} · Valores en COP</span></div>
                <div className="admin-metrics-grid">
                  {[
                    {label:'Valor de los pedidos',value:formatMoney(overviewRevenue),description:'No incluye pedidos cancelados.',icon:DollarSign},
                    {label:'Pedidos recibidos',value:overviewCount,description:'Pedidos no cancelados del período.',icon:ClipboardList},
                    {label:'Promedio por pedido',value:formatMoney(overviewAverage),description:'Valor total dividido entre los pedidos.',icon:TrendingUp},
                    {label:'Unidades vendidas',value:overviewUnits,description:'Suma de las unidades en los pedidos.',icon:ShoppingBag}
                  ].map(({label,value,description,icon:Icon}) => <article className="admin-metric" key={label}><div><span>{label}</span><Icon size={18} aria-hidden="true" /></div><strong>{value}</strong><p>{description}</p></article>)}
                </div>
              </section>

              <section className="admin-tasks" aria-labelledby="admin-tasks-title">
                <div className="admin-section-label"><h2 id="admin-tasks-title">¿Qué necesitas hacer?</h2><span>Pendientes de toda la tienda</span></div>
                <div className="admin-task-grid">
                  <button type="button" onClick={() => setActiveTab('orders')}><span className="admin-task-icon"><ClipboardList size={21} /></span><span><strong>{pendingOrders.length} {pendingOrders.length === 1 ? 'pedido por gestionar' : 'pedidos por gestionar'}</strong><small>Revisa, acepta y prepara las compras.</small></span><ArrowRight size={18} /></button>
                  <button type="button" onClick={() => { setInventoryFilter('attention'); setInventoryPage(1); setActiveTab('inventory'); }}><span className="admin-task-icon"><Boxes size={21} /></span><span><strong>{inventorySummary.lowProductCount + inventorySummary.outProductCount} {(inventorySummary.lowProductCount + inventorySummary.outProductCount) === 1 ? 'producto por reponer' : 'productos por reponer'}</strong><small>{inventorySummary.outProductCount} con tallas agotadas · {inventorySummary.lowProductCount} con tallas bajas</small></span><ArrowRight size={18} /></button>
                  <button type="button" onClick={() => setActiveTab('products')}><span className="admin-task-icon"><ShoppingBag size={21} /></span><span><strong>Administrar catálogo</strong><small>Consulta productos, precios e imágenes.</small></span><ArrowRight size={18} /></button>
                </div>
              </section>
              {/* Gráfica Recharts Interactiva Premium */}
              <div className="admin-overview-chart"
                style={{
                  backgroundColor: 'var(--bf-secondary)',
                  border: '1px solid var(--bf-border)',
                  borderRadius: '10px',
                  padding: '24px 28px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
                }}
              >
                {/* Cabecera y controles interactivos de la gráfica */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--bf-border)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--bf-muted)' }}>
                        VENTAS EN EL TIEMPO
                      </span>
                      <span className="admin-live-pill">
                        <span className="chart-pulse-badge" /> PEDIDOS REGISTRADOS
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: 'var(--bf-text)', letterSpacing: '-0.02em' }}>
                      {chartViewMode === 'revenue_accum' && 'Valor acumulado de los pedidos'}
                      {chartViewMode === 'revenue' && 'Valor de los pedidos por fecha'}
                      {chartViewMode === 'orders' && 'Cantidad de pedidos por fecha'}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--bf-muted)' }}>
                      {chartViewMode.startsWith('revenue') 
                        ? `Total acumulado: ${formatMoney(overviewRevenue)} en ${overviewCount} pedidos (${overviewUnits} unidades)`
                        : `${overviewCount} pedidos · ${overviewPeriod}`}
                    </p>
                  </div>

                  {/* Selector de métricas y tipo de gráfica */}
                  <div className="admin-chart-controls">
                    <div className="admin-period-controls">
                      {[
                        { id: 'revenue_accum', label: 'Acumulado' },
                        { id: 'revenue', label: 'Por día' },
                        { id: 'orders', label: 'Pedidos' }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          type="button"
                          aria-pressed={chartViewMode === mode.id}
                          onClick={() => setChartViewMode(mode.id)}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>

                    <div className="admin-period-controls">
                      <button
                        type="button"
                        aria-pressed={chartType === 'area'}
                        onClick={() => setChartType('area')}
                        aria-label="Ver gráfica de líneas"
                        title="Ver gráfica de líneas"
                      >
                        <Activity size={14} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-pressed={chartType === 'bar'}
                        onClick={() => setChartType('bar')}
                        aria-label="Ver gráfica de barras"
                        title="Ver gráfica de barras"
                      >
                        <BarChart3 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                {overviewCount === 0 && <div className="admin-chart-empty" role="status"><BarChart3 size={20} aria-hidden="true" /><div><strong>No hay ventas registradas en este período</strong><p>Prueba otro rango de fechas para consultar tus pedidos anteriores.</p></div></div>}
                {/* Render de Recharts con Animaciones Fluidas y Tooltips */}
                <div style={{ width: '100%', height: '280px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
                      <AreaChart
                        data={chartData}
                        margin={{ top: 15, right: 15, left: -5, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="luxuryRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--bf-text)" stopOpacity={0.16} />
                            <stop offset="60%" stopColor="var(--bf-text)" stopOpacity={0.03} />
                            <stop offset="98%" stopColor="var(--bf-text)" stopOpacity={0.00} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bf-border)" vertical={false} />
                        <XAxis
                          dataKey="label"
                          axisLine={{ stroke: 'var(--bf-border)' }}
                          tickLine={false}
                          tick={{ fill: 'var(--bf-muted)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                          dy={8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'var(--bf-muted)', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                          tickFormatter={(val) => {
                            if (chartViewMode === 'orders') return `${val}`;
                            if (val === 0) return '$0';
                            if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                            return val >= 1000 ? `$${Math.round(val / 1000)} mil` : `$${Math.round(val)}`;
                          }}
                          dx={-5}
                        />
                        <Tooltip
                          content={<CustomChartTooltip formatMoney={formatMoney} chartViewMode={chartViewMode} />}
                          cursor={{ stroke: 'var(--bf-text)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                        />
                        <Area
                          type="monotone"
                          dataKey={chartViewMode === 'orders' ? 'orders' : (chartViewMode === 'revenue' ? 'revenue' : 'revenue_accum')}
                          stroke="var(--bf-text)"
                          strokeWidth={2.6}
                          fill="url(#luxuryRevenueGradient)"
                          activeDot={<CustomActiveDot />}
                          animationDuration={900}
                          animationEasing="ease-out"
                        />
                      </AreaChart>
                    ) : (
                      <BarChart
                        data={chartData}
                        margin={{ top: 15, right: 15, left: -5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bf-border)" vertical={false} />
                        <XAxis
                          dataKey="label"
                          axisLine={{ stroke: 'var(--bf-border)' }}
                          tickLine={false}
                          tick={{ fill: 'var(--bf-muted)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                          dy={8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'var(--bf-muted)', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                          tickFormatter={(val) => {
                            if (chartViewMode === 'orders') return `${val}`;
                            if (val === 0) return '$0';
                            if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                            return val >= 1000 ? `$${Math.round(val / 1000)} mil` : `$${Math.round(val)}`;
                          }}
                          dx={-5}
                        />
                        <Tooltip
                          content={<CustomChartTooltip formatMoney={formatMoney} chartViewMode={chartViewMode} />}
                          cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                        />
                        <Bar
                          dataKey={chartViewMode === 'orders' ? 'orders' : (chartViewMode === 'revenue' ? 'revenue' : 'revenue_accum')}
                          fill="var(--bf-text)"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={38}
                          animationDuration={850}
                          animationEasing="ease-out"
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Barra inferior informativa con leyenda interactiva y accesos rápidos */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '16px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--bf-border)',
                    fontSize: '0.74rem',
                    color: 'var(--bf-muted)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--bf-secondary)', borderRadius: '50%' }} />
                      <span>{chartViewMode.startsWith('revenue') ? 'Valor de pedidos (COP)' : 'Pedidos no cancelados'}</span>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span className="chart-pulse-badge" />
                      <span>Promedio por pedido: <strong>{formatMoney(overviewAverage)}</strong></span>
                    </span>
                  </div>

                  <span style={{ color: 'var(--bf-muted)', fontSize: '0.72rem' }}>
                    Pasa el cursor sobre la gráfica para ver detalles por fecha
                  </span>
                </div>
              </div>

              {/* Distribución de Pedidos & Top Prendas */}
              <div className="admin-dashboard-split">
                {/* Columna 1: Distribución por Estados */}
                <div className="admin-panel-card">
                  <div className="admin-panel-head">
                    <h4>Estado de todos los pedidos</h4>
                    <span className="admin-panel-meta">Total {orders.length}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { label: 'Entregados', count: deliveredOrders.length, color: '#4ade80' },
                      { label: 'En proceso / Pendientes', count: pendingOrders.length, color: '#fbbf24' },
                      { label: 'Cancelados', count: cancelledOrders.length, color: '#ff1724' }
                    ].map(st => {
                      const pct = orders.length > 0 ? Math.round((st.count / orders.length) * 100) : 0;
                      return (
                        <div key={st.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '7px' }}>
                            <span style={{ color: '#e5e5e5', fontWeight: '600' }}>{st.label}</span>
                            <span className="admin-tabular" style={{ color: '#a6a6a6' }}>{st.count} ({pct}%)</span>
                          </div>
                          <div style={{ height: '6px', width: '100%', backgroundColor: '#0b0b0b', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: st.color, borderRadius: '999px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Columna 2: Top 5 Productos más vendidos */}
                <div className="admin-panel-card">
                  <div className="admin-panel-head">
                    <h4>Productos más vendidos</h4>
                    <span className="admin-panel-meta">Histórico · Por unidades</span>
                  </div>

                  {topProducts.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>Aún no hay ventas registradas.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {topProducts.map((item, idx) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            padding: '10px 0',
                            borderBottom: idx < topProducts.length - 1 ? '1px solid #242424' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            <span className="admin-tabular" style={{ fontSize: '11px', fontWeight: '700', color: '#777', width: '18px', flexShrink: 0 }}>
                              0{idx + 1}
                            </span>
                            <ProductImage mode='thumb'
                              src={item.image}
                              alt={item.name}
                              style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#0b0b0b', border: '1px solid #262626', flexShrink: 0 }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: '#f4f4f2', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.name}
                              </span>
                              <span style={{ fontSize: '11px', color: '#999' }}>
                                {item.quantity} unidades vendidas
                              </span>
                            </div>
                          </div>
                          <strong className="admin-tabular" style={{ fontSize: '13px', color: '#f4f4f2', flexShrink: 0 }}>
                            {formatMoney(item.revenue)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tabla Resumen de Órdenes Recientes */}
              <div className="admin-table-card">
                <div className="admin-panel-head" style={{ padding: '22px 24px 0', marginBottom: '14px' }}>
                  <div>
                    <h4>Últimos pedidos recibidos</h4>
                    <p>Transacciones más recientes en tienda</p>
                  </div>
                  <button
                    type="button"
                    className="admin-link-btn"
                    onClick={() => setActiveTab('orders')}
                  >
                    <span>Ver todos los pedidos</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </div>

                <div className="admin-table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID Pedido</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Prendas</th>
                        <th>Total (COP)</th>
                        <th>Estado</th>
                        <th style={{ textAlign: 'right' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 4).map(ord => (
                        <tr key={ord.orderId}>
                          <td style={{ fontWeight: '700', color: '#f4f4f2' }}>{ord.orderId}</td>
                          <td style={{ color: '#999' }}>{ord.date}</td>
                          <td>
                            <div style={{ fontWeight: '600', color: '#f4f4f2' }}>{ord.customer?.name}</div>
                            <div style={{ fontSize: '11px', color: '#888' }}>{ord.customer?.city || 'Medellín'}</div>
                          </td>
                          <td className="admin-tabular" style={{ color: '#a6a6a6' }}>{ord.count || (ord.items || []).length} ud(s)</td>
                          <td className="admin-tabular" style={{ fontWeight: '700', color: '#f4f4f2' }}>{formatMoney(ord.total)}</td>
                          <td>{renderOrderStatusBadge(ord.orderStatus)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="admin-btn-outline is-compact"
                              onClick={() => {
                                setSelectedOrderDetails(ord);
                                setActiveTab('orders');
                              }}
                            >
                              Detalles
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              VISTA 2: PRODUCTOS (CATÁLOGO DE MODA)
              ============================================================== */}
          {activeTab === 'products' && (
            <div className="admin-view-animated admin-view-stack">
              <section className="admin-welcome admin-report-heading" aria-labelledby="admin-products-title">
                <div>
                  <span className="admin-eyebrow">SAUZ / CATÁLOGO</span>
                  <h1 id="admin-products-title">CATÁLOGO DE PRENDAS.</h1>
                  <p>Gestiona referencias, precios en COP, categorías y disponibilidad en tienda.</p>
                </div>
                <button type="button" className="admin-primary-action" onClick={handleOpenCreateProduct}>
                  <Plus size={17} aria-hidden="true" /> Nuevo producto
                </button>
              </section>

              <div className="admin-metrics-grid-3">
                <article className="admin-metric">
                  <div><span>Total referencias</span><ShoppingBag size={18} aria-hidden="true" /></div>
                  <strong className="admin-tabular">{products.length}</strong>
                  <p>{productCategories.length - 1} categorías activas en catálogo.</p>
                </article>
                <article className="admin-metric">
                  <div><span>Listas para venta</span><CheckCircle2 size={18} aria-hidden="true" /></div>
                  <strong className="admin-tabular is-positive">{products.filter(p => p.price != null && p.stock > 0).length}</strong>
                  <p>Referencias con precio comercial y stock confirmado.</p>
                </article>
                <article className="admin-metric">
                  <div><span>Por clasificar o sin precio</span><AlertCircle size={18} aria-hidden="true" /></div>
                  <strong className={`admin-tabular ${products.filter(p => p.price == null || p.stock === 0).length > 0 ? 'is-warning' : ''}`}>{products.filter(p => p.price == null || p.stock === 0).length}</strong>
                  <p>Prendas pendientes de precio comercial o reposición.</p>
                </article>
              </div>

              {/* Barra estructurada en 2 filas */}
              <div className="admin-toolbar is-stacked">
                <div className="admin-toolbar-row">
                  <div className="admin-search-box">
                    <Search size={16} aria-hidden="true" />
                    <input
                      type="text"
                      aria-label="Buscar prenda"
                      placeholder="Buscar prenda por nombre, marca, categoría o SKU..."
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setProductsPage(1);
                      }}
                    />
                  </div>

                  <div className="admin-filter-group">
                    {[
                      { id: 'Todos', label: 'Todos' },
                      { id: 'in_stock', label: 'Disponible' },
                      { id: 'low_stock', label: 'Stock bajo' },
                      { id: 'out_of_stock', label: 'Agotado' }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        className={`admin-filter-pill ${productStockFilter === st.id ? 'is-active' : ''}`}
                        onClick={() => {
                          setProductStockFilter(st.id);
                          setProductsPage(1);
                        }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <div className="admin-segmented" role="group" aria-label="Modo de visualización">
                    <button
                      type="button"
                      className={productViewMode === 'table' ? 'is-active' : ''}
                      onClick={() => setProductViewMode('table')}
                    >
                      Tabla
                    </button>
                    <button
                      type="button"
                      className={productViewMode === 'cards' ? 'is-active' : ''}
                      onClick={() => setProductViewMode('cards')}
                    >
                      Tarjetas
                    </button>
                  </div>
                </div>

                <div className="admin-toolbar-row" style={{ paddingTop: '10px', borderTop: '1px solid #242426' }}>
                  <div className="admin-filter-group">
                    <span className="admin-filter-label">Categoría:</span>
                    {productCategories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        className={`admin-filter-pill ${productCategoryFilter === cat ? 'is-active' : ''}`}
                        onClick={() => {
                          setProductCategoryFilter(cat);
                          setProductsPage(1);
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <span className="admin-panel-meta admin-tabular">
                    Mostrando {filteredProducts.length} de {products.length} prendas
                  </span>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="admin-table-card">
                  <div className="admin-empty-state">
                    <ShoppingBag size={28} aria-hidden="true" />
                    <h4>No se encontraron prendas</h4>
                    <p>Ajusta la búsqueda o limpia los filtros activos para ver todo el catálogo.</p>
                    <button
                      type="button"
                      className="admin-btn-outline is-compact"
                      onClick={() => {
                        setProductSearch('');
                        setProductCategoryFilter('Todas');
                        setProductStockFilter('Todos');
                        setProductsPage(1);
                      }}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              ) : productViewMode === 'table' ? (
                <div className="admin-table-card">
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Prenda</th>
                          <th>Categoría</th>
                          <th>Precio (COP)</th>
                          <th>Tallas disponibles</th>
                          <th>Estado</th>
                          <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map(p => (
                          <tr key={p.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <ProductImage mode='thumb'
                                  src={p.image}
                                  alt={p.name}
                                  style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#0b0b0b', border: '1px solid #262626', flexShrink: 0 }}
                                />
                                <div>
                                  <span style={{ fontWeight: '700', color: '#f4f4f2', display: 'block' }}>{p.name}</span>
                                  <span style={{ fontSize: '11px', color: '#888' }}>{p.sku || `SKU-${p.id}`}{p.brand ? ` · ${p.brand}` : ''}</span>
                                </div>
                              </div>
                            </td>
                            <td><span className="admin-tag-pill">{p.category}</span></td>
                            <td className="admin-tabular" style={{ fontWeight: '700', color: p.price != null ? '#f4f4f2' : '#888' }}>
                              {p.price != null ? formatMoney(p.price) : 'Por definir'}
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <strong className="admin-tabular" style={{ color: '#f4f4f2' }}>{p.stock} uds</strong>
                                <span style={{ fontSize: '11px', color: '#888' }}>
                                  {(p.variants?.length ? p.variants.map(v => v.size) : p.sizes || ['Única']).join(', ')}
                                </span>
                              </div>
                            </td>
                            <td>
                              {p.price == null ? (
                                <span className="admin-status-pill is-neutral">Sin precio</span>
                              ) : p.stock === 0 ? (
                                <span className="admin-status-pill is-danger">Agotado</span>
                              ) : p.stock <= 5 ? (
                                <span className="admin-status-pill is-warning">Stock bajo</span>
                              ) : (
                                <span className="admin-status-pill is-success">Disponible</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  className="admin-icon-btn"
                                  onClick={() => handleOpenEditProduct(p)}
                                  title="Editar prenda"
                                  aria-label={`Editar ${p.name}`}
                                >
                                  <Edit3 size={14} aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  className="admin-icon-btn is-danger"
                                  onClick={() => setDeleteConfirmProduct(p)}
                                  title="Eliminar del catálogo"
                                  aria-label={`Eliminar ${p.name}`}
                                >
                                  <Trash2 size={14} aria-hidden="true" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalProductPages > 1 && (
                    <div className="admin-pagination">
                      <span className="admin-tabular">
                        Página {productsPage} de {totalProductPages} ({filteredProducts.length} prendas)
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="admin-btn-outline is-compact"
                          disabled={productsPage === 1}
                          onClick={() => setProductsPage(p => Math.max(1, p - 1))}
                        >
                          Anterior
                        </button>
                        <button
                          type="button"
                          className="admin-btn-outline is-compact"
                          disabled={productsPage === totalProductPages}
                          onClick={() => setProductsPage(p => Math.min(totalProductPages, p + 1))}
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="admin-product-grid">
                    {paginatedProducts.map(p => (
                      <article key={p.id} className="admin-product-card">
                        <div className="admin-product-media">
                          <ProductImage mode='thumb'
                            src={p.image}
                            alt={p.name}
                          />
                          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                            {renderStockBadge(p.stock)}
                          </div>
                        </div>

                        <div className="admin-product-body">
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#f4f4f2' }}>{p.name}</h4>
                              <span className="admin-tabular" style={{ fontSize: '14px', fontWeight: '700', color: '#f4f4f2', flexShrink: 0 }}>
                                {p.price != null ? formatMoney(p.price) : 'Por definir'}
                              </span>
                            </div>
                            <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>
                              {p.category} · {p.sku || `SKU-${p.id}`}{p.brand ? ` · ${p.brand}` : ''}
                            </span>
                          </div>

                          <div className="admin-product-actions">
                            <button
                              type="button"
                              className="admin-btn-outline is-compact"
                              onClick={() => handleOpenEditProduct(p)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="admin-btn-danger"
                              onClick={() => setDeleteConfirmProduct(p)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {totalProductPages > 1 && (
                    <div className="admin-table-card">
                      <div className="admin-pagination" style={{ borderTop: 0 }}>
                        <span className="admin-tabular">
                          Página {productsPage} de {totalProductPages} ({filteredProducts.length} prendas)
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="admin-btn-outline is-compact"
                            disabled={productsPage === 1}
                            onClick={() => setProductsPage(p => Math.max(1, p - 1))}
                          >
                            Anterior
                          </button>
                          <button
                            type="button"
                            className="admin-btn-outline is-compact"
                            disabled={productsPage === totalProductPages}
                            onClick={() => setProductsPage(p => Math.min(totalProductPages, p + 1))}
                          >
                            Siguiente
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ==============================================================
              VISTA 3: INVENTARIO (CONTROL AGRUPADO POR PRENDA Y TALLA)
              ============================================================== */}
          {activeTab === 'inventory' && (
            <div className="admin-view-animated admin-view-stack">
              <section className="admin-welcome admin-report-heading" aria-labelledby="admin-inventory-title">
                <div>
                  <span className="admin-eyebrow">SAUZ / BODEGA</span>
                  <h1 id="admin-inventory-title">INVENTARIO Y EXISTENCIAS.</h1>
                  <p>Consulta todas las tallas por prenda y repón unidades en un clic desde un solo lugar.</p>
                </div>
                <div className="admin-report-heading-action">
                  <button type="button" className="admin-btn-outline" onClick={exportInventoryToCSV}>
                    <Download size={15} aria-hidden="true" />
                    <span>Exportar CSV</span>
                  </button>
                </div>
              </section>

              {/* Resumen coherente con la tabla inferior */}
              <div className="admin-metrics-grid-3">
                <article className="admin-metric">
                  <div><span>Unidades en bodega</span><Boxes size={18} aria-hidden="true" /></div>
                  <strong className="admin-tabular">{inventorySummary.totalUnits}</strong>
                  <p>Distribuidas en {inventorySummary.productCount} prendas activas.</p>
                </article>

                <article className="admin-metric">
                  <div><span>Prendas con stock bajo</span><AlertTriangle size={18} aria-hidden="true" /></div>
                  <strong className={`admin-tabular ${inventorySummary.lowProductCount > 0 ? 'is-warning' : 'is-positive'}`}>{inventorySummary.lowProductCount}</strong>
                  <p>{inventorySummary.lowVariantCount} talla(s) con ≤ {lowStockThreshold} unidades.</p>
                </article>

                <article className="admin-metric">
                  <div><span>Prendas con talla agotada</span><AlertCircle size={18} aria-hidden="true" /></div>
                  <strong className={`admin-tabular ${inventorySummary.outProductCount > 0 ? 'is-danger' : 'is-positive'}`}>{inventorySummary.outProductCount}</strong>
                  <p>{inventorySummary.outVariantCount} talla(s) sin existencias (0 uds).</p>
                </article>
              </div>

              {/* Barra única de búsqueda, estado y umbral */}
              <div className="admin-toolbar">
                <div className="admin-search-box">
                  <Search size={16} aria-hidden="true" />
                  <input
                    type="text"
                    aria-label="Buscar en inventario"
                    placeholder="Buscar prenda, marca, categoría o SKU..."
                    value={inventorySearch}
                    onChange={(e) => {
                      setInventorySearch(e.target.value);
                      setInventoryPage(1);
                    }}
                  />
                </div>

                <div className="admin-filter-group">
                  {[
                    { id: 'all', label: `Todas (${inventorySummary.productCount})` },
                    { id: 'attention', label: `Por reponer (${inventorySummary.outProductCount + inventorySummary.lowProductCount})` },
                    { id: 'out', label: `Con agotadas (${inventorySummary.outProductCount})` },
                    { id: 'ok', label: `Al día (${inventorySummary.healthyProductCount})` }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`admin-filter-pill ${inventoryFilter === f.id ? 'is-active' : ''}`}
                      onClick={() => {
                        setInventoryFilter(f.id);
                        setInventoryPage(1);
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="admin-filter-group">
                  <span className="admin-filter-label">Alerta si ≤</span>
                  {[3, 5, 10, 15].map((thresh) => (
                    <button
                      key={thresh}
                      type="button"
                      className={`admin-filter-pill is-danger ${lowStockThreshold === thresh ? 'is-active' : ''}`}
                      onClick={() => {
                        setLowStockThreshold(thresh);
                        setInventoryPage(1);
                      }}
                    >
                      {thresh}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabla agrupada: 1 fila por prenda */}
              <div className="admin-table-card">
                {paginatedInventoryRows.length === 0 ? (
                  <div className="admin-empty-state">
                    <CheckCircle2 size={28} aria-hidden="true" />
                    <h4>Sin prendas en esta vista</h4>
                    <p>Prueba otro filtro o limpia el buscador para ver todo el inventario.</p>
                    <button
                      type="button"
                      className="admin-btn-outline is-compact"
                      onClick={() => {
                        setInventorySearch('');
                        setInventoryFilter('all');
                        setInventoryPage(1);
                      }}
                    >
                      Ver todas las prendas
                    </button>
                  </div>
                ) : (
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Prenda</th>
                          <th>Stock por talla (clic para elegir)</th>
                          <th>Total</th>
                          <th style={{ textAlign: 'right' }}>Reponer stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedInventoryRows.map(({ product: p, variants, totalStock, status, suggestedVariant }) => {
                          const activeVariantId = restockVariants[p.id] || suggestedVariant?.id;
                          const selectedVariant = variants.find(v => v.id === activeVariantId) || suggestedVariant || variants[0];
                          const inputVal = customRestockInputs[p.id] || '';
                          return (
                            <tr key={p.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <ProductImage mode='thumb'
                                    src={p.image}
                                    alt={p.name}
                                    style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#0b0b0b', border: '1px solid #262626', flexShrink: 0 }}
                                  />
                                  <div>
                                    <strong style={{ color: '#f4f4f2', display: 'block' }}>{p.name}</strong>
                                    <span style={{ fontSize: '11px', color: '#888' }}>
                                      {p.sku || `SKU-${p.id}`} · {p.category}{p.brand ? ` · ${p.brand}` : ''}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div className="admin-size-chips">
                                  {variants.map((v) => {
                                    const isSelected = selectedVariant?.id === v.id;
                                    const tone = v.stock === 0 ? 'is-out' : (v.stock <= lowStockThreshold ? 'is-low' : '');
                                    return (
                                      <button
                                        key={v.id || v.size}
                                        type="button"
                                        className={`admin-size-chip ${tone} ${isSelected ? 'is-selected' : ''}`}
                                        onClick={() => setRestockVariants(prev => ({ ...prev, [p.id]: v.id }))}
                                        title={`Seleccionar talla ${v.size} (${v.stock} uds)`}
                                      >
                                        <span>{v.size}</span>
                                        <strong>{v.stock}</strong>
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>

                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                                  <strong className="admin-tabular" style={{ color: '#f4f4f2' }}>{totalStock} uds</strong>
                                  <span className={`admin-status-pill ${status === 'out' ? 'is-danger' : (status === 'low' ? 'is-warning' : 'is-success')}`}>
                                    {status === 'out' ? 'Talla agotada' : (status === 'low' ? 'Stock bajo' : 'Al día')}
                                  </span>
                                </div>
                              </td>

                              <td style={{ textAlign: 'right' }}>
                                <div className="admin-inventory-restock">
                                  <span className="admin-inventory-target">
                                    Talla {selectedVariant?.size}:
                                  </span>
                                  {[5, 10].map((qty) => (
                                    <button
                                      key={qty}
                                      type="button"
                                      className="admin-btn-outline is-compact"
                                      onClick={() => handleQuickRestock(p.id, qty, selectedVariant?.id)}
                                    >
                                      +{qty}
                                    </button>
                                  ))}
                                  <input
                                    type="number"
                                    min="1"
                                    className="admin-inventory-qty"
                                    aria-label={`Cantidad para ${p.name} talla ${selectedVariant?.size}`}
                                    placeholder="Cant."
                                    value={inputVal}
                                    onChange={(e) => setCustomRestockInputs({ ...customRestockInputs, [p.id]: e.target.value })}
                                  />
                                  <button
                                    type="button"
                                    className="admin-btn-outline is-compact"
                                    onClick={() => handleQuickRestock(p.id, inputVal, selectedVariant?.id)}
                                  >
                                    Sumar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {totalInventoryPages > 1 && (
                  <div className="admin-pagination">
                    <span className="admin-tabular">
                      Página {inventoryPage} de {totalInventoryPages} ({filteredInventoryRows.length} prendas)
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="admin-btn-outline is-compact"
                        disabled={inventoryPage === 1}
                        onClick={() => setInventoryPage(p => Math.max(1, p - 1))}
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        className="admin-btn-outline is-compact"
                        disabled={inventoryPage === totalInventoryPages}
                        onClick={() => setInventoryPage(p => Math.min(totalInventoryPages, p + 1))}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==============================================================
              VISTA 4: PEDIDOS (GESTIÓN INTEGRAL DE ÓRDENES)
              ============================================================== */}
          {activeTab === 'orders' && (
            <div className="admin-view-animated admin-view-stack">
              <section className="admin-welcome admin-report-heading" aria-labelledby="admin-orders-title">
                <div>
                  <span className="admin-eyebrow">SAUZ / OPERACIÓN</span>
                  <h1 id="admin-orders-title">GESTIÓN DE PEDIDOS.</h1>
                  <p>Consulta órdenes recibidas, actualiza estados de despacho y registra guías de envío.</p>
                </div>
                <div className="admin-report-heading-action">
                  <button
                    type="button"
                    className="admin-btn-outline is-compact"
                    onClick={() => setOrderSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  >
                    {orderSortOrder === 'desc' ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronUp size={14} aria-hidden="true" />}
                    <span>{orderSortOrder === 'desc' ? 'Recientes' : 'Antiguos'}</span>
                  </button>
                  <button type="button" className="admin-btn-outline is-compact" onClick={exportOrdersToCSV}>
                    <Download size={14} aria-hidden="true" />
                    <span>CSV</span>
                  </button>
                </div>
              </section>

              <div className="admin-metrics-grid-3">
                <article className="admin-metric">
                  <div><span>Total pedidos</span><ClipboardList size={18} aria-hidden="true" /></div>
                  <strong className="admin-tabular">{orders.length}</strong>
                  <p>Órdenes históricas registradas en tienda.</p>
                </article>
                <article className="admin-metric">
                  <div><span>Pendientes por gestionar</span><Clock size={18} aria-hidden="true" /></div>
                  <strong className={`admin-tabular ${pendingOrders.length > 0 ? 'is-warning' : 'is-positive'}`}>{pendingOrders.length}</strong>
                  <p>Pedidos recibidos, aceptados o en preparación.</p>
                </article>
                <article className="admin-metric">
                  <div><span>Pedidos entregados</span><PackageCheck size={18} aria-hidden="true" /></div>
                  <strong className="admin-tabular is-positive">{deliveredOrders.length}</strong>
                  <p>Órdenes completadas satisfactoriamente.</p>
                </article>
              </div>

              {/* Barra estructurada */}
              <div className="admin-toolbar is-stacked">
                <div className="admin-toolbar-row">
                  <div className="admin-search-box">
                    <Search size={16} aria-hidden="true" />
                    <input
                      type="text"
                      aria-label="Buscar pedido"
                      placeholder="Buscar por ID, cliente, correo o ciudad..."
                      value={orderSearch}
                      onChange={(e) => {
                        setOrderSearch(e.target.value);
                        setOrdersPage(1);
                      }}
                    />
                  </div>
                  <span className="admin-panel-meta admin-tabular">
                    {filteredOrders.length} pedido(s) en vista
                  </span>
                </div>

                <div className="admin-toolbar-row" style={{ paddingTop: '10px', borderTop: '1px solid #242426' }}>
                  <div className="admin-filter-group">
                    <span className="admin-filter-label">Estado:</span>
                    {[
                      { id: 'Todos', label: `Todos (${orders.length})` },
                      { id: 'Por gestionar', label: `Pendientes (${pendingOrders.length})` },
                      { id: 'Pendiente', label: 'Recibido' },
                      { id: 'Aceptado', label: 'Aceptado' },
                      { id: 'En proceso', label: 'En preparación' },
                      { id: 'Enviado', label: 'Enviado' },
                      { id: 'Entregado', label: 'Entregado' },
                      { id: 'Cancelado', label: 'Cancelado' }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        className={`admin-filter-pill ${orderStatusFilter === st.id ? 'is-active' : ''}`}
                        onClick={() => {
                          setOrderStatusFilter(st.id);
                          setOrdersPage(1);
                        }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabla de Pedidos */}
              <div className="admin-table-card">
                {paginatedOrders.length === 0 ? (
                  <div className="admin-empty-state">
                    <ClipboardList size={30} aria-hidden="true" />
                    <h4>No se encontraron órdenes</h4>
                    <p>Intenta ajustar el término de búsqueda o cambia el filtro de estado.</p>
                    {orderStatusFilter !== 'Todos' && (
                      <button
                        type="button"
                        className="admin-btn-outline is-compact"
                        onClick={() => {
                          setOrderStatusFilter('Todos');
                          setOrderSearch('');
                          setOrdersPage(1);
                        }}
                      >
                        Ver todos los pedidos
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Pedido</th>
                          <th>Cliente</th>
                          <th>Prendas</th>
                          <th>Pago</th>
                          <th>Total (COP)</th>
                          <th>Estado actual</th>
                          <th style={{ textAlign: 'right' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOrders.map(ord => {
                          const itemCount = ord.count || (ord.items || []).reduce((s, it) => s + Number(it.quantity || 1), 0);
                          const firstItem = ord.items?.[0]?.name;
                          return (
                            <tr key={ord.orderId}>
                              <td>
                                <strong style={{ color: '#f4f4f2', display: 'block' }}>{ord.orderId}</strong>
                                <span style={{ fontSize: '11px', color: '#888' }}>{ord.date}</span>
                              </td>
                              <td>
                                <div style={{ fontWeight: '600', color: '#f4f4f2' }}>{ord.customer?.name}</div>
                                <div style={{ fontSize: '11px', color: '#888' }}>{ord.customer?.email}{ord.customer?.city ? ` · ${ord.customer.city}` : ''}</div>
                              </td>
                              <td>
                                <strong className="admin-tabular" style={{ color: '#e5e5e5', display: 'block' }}>{itemCount} {itemCount === 1 ? 'prenda' : 'prendas'}</strong>
                                {firstItem && <span style={{ fontSize: '11px', color: '#888' }}>{firstItem}{ord.items?.length > 1 ? ` +${ord.items.length - 1}` : ''}</span>}
                              </td>
                              <td>
                                <span style={{ fontSize: '12px', color: '#e5e5e5', fontWeight: '600', display: 'block' }}>
                                  {ord.payment?.method === 'card' ? 'Tarjeta' : (ord.payment?.method === 'transfer' ? 'Transferencia' : 'Efectivo')}
                                </span>
                                <span style={{ fontSize: '11px', color: '#888' }}>
                                  {ord.payment?.status}
                                </span>
                              </td>
                              <td className="admin-tabular" style={{ fontWeight: '700', color: '#f4f4f2' }}>
                                {formatMoney(ord.total)}
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                                  {renderOrderStatusBadge(ord.orderStatus)}
                                  <select
                                    className="admin-inline-select"
                                    aria-label={`Cambiar estado del pedido ${ord.orderId}`}
                                    value={ord.orderStatus || 'En proceso'}
                                    onChange={(e) => updateOrderStatus(ord.orderId, e.target.value)}
                                  >
                                    <option value="Pendiente">Recibido / Pendiente</option>
                                    <option value="Aceptado">Aceptado</option>
                                    <option value="En proceso">En preparación</option>
                                    <option value="Enviado">Enviado</option>
                                    <option value="Entregado">Entregado</option>
                                    <option value="Cancelado">Cancelado</option>
                                  </select>
                                </div>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  type="button"
                                  className="admin-btn-outline is-compact"
                                  onClick={() => setSelectedOrderDetails(ord)}
                                >
                                  <Eye size={13} aria-hidden="true" />
                                  <span>Detalle</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {totalOrderPages > 1 && (
                  <div className="admin-pagination">
                    <span className="admin-tabular">
                      Página {ordersPage} de {totalOrderPages} ({filteredOrders.length} pedidos en total)
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="admin-btn-outline is-compact"
                        disabled={ordersPage === 1}
                        onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        className="admin-btn-outline is-compact"
                        disabled={ordersPage === totalOrderPages}
                        onClick={() => setOrdersPage(p => Math.min(totalOrderPages, p + 1))}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==============================================================
              VISTA 5: CLIENTES (DIRECTORIO DE COMPRADORES)
              ============================================================== */}
          {activeTab === 'customers' && (
            <div className="admin-view-animated admin-view-stack">
              <section className="admin-welcome admin-report-heading" aria-labelledby="admin-customers-title">
                <div>
                  <span className="admin-eyebrow">SAUZ / COMUNIDAD</span>
                  <h1 id="admin-customers-title">DIRECTORIO DE CLIENTES.</h1>
                  <p>Historial de compradores registrados, frecuencia de pedidos y facturación acumulada.</p>
                </div>
                <div className="admin-report-heading-action">
                  <span className="admin-date-current admin-tabular">{filteredCustomers.length} clientes</span>
                </div>
              </section>

              <div className="admin-metrics-grid-3">
                <article className="admin-metric">
                  <div><span>Clientes registrados</span><Users size={18} aria-hidden="true" /></div>
                  <strong className="admin-tabular">{customers.length}</strong>
                  <p>Compradores con al menos una orden registrada.</p>
                </article>
                <article className="admin-metric">
                  <div><span>Clientes recurrentes</span><TrendingUp size={18} aria-hidden="true" /></div>
                  <strong className="admin-tabular is-positive">{customers.filter(c => c.orderCount > 1).length}</strong>
                  <p>Compradores con 2 o más pedidos en la tienda.</p>
                </article>
                <article className="admin-metric">
                  <div><span>Compra promedio por cliente</span><DollarSign size={18} aria-hidden="true" /></div>
                  <strong className="admin-tabular">
                    {formatMoney(customers.length ? Math.round(customers.reduce((s, c) => s + Number(c.totalSpent || 0), 0) / customers.length) : 0)}
                  </strong>
                  <p>Facturación acumulada dividida entre compradores.</p>
                </article>
              </div>

              <div className="admin-toolbar">
                <div className="admin-search-box">
                  <Search size={16} aria-hidden="true" />
                  <input
                    type="text"
                    aria-label="Buscar cliente"
                    placeholder="Buscar cliente por nombre, email o ciudad..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setCustomersPage(1);
                    }}
                  />
                </div>
                <span className="admin-panel-meta admin-tabular">
                  {loadingCustomers ? 'Cargando directorio...' : `${filteredCustomers.length} clientes encontrados`}
                </span>
              </div>

              <div className="admin-table-card">
                {paginatedCustomers.length === 0 ? (
                  <div className="admin-empty-state">
                    <Users size={30} aria-hidden="true" />
                    <h4>Sin resultados en el directorio</h4>
                    <p>No hay clientes que coincidan con el término de búsqueda.</p>
                  </div>
                ) : (
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Cliente</th>
                          <th>Contacto</th>
                          <th>Ciudad</th>
                          <th>Pedidos</th>
                          <th>Total comprado (COP)</th>
                          <th>Última compra</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCustomers.map((c, idx) => (
                          <tr key={idx}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="admin-customer-avatar">
                                  {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                                </div>
                                <strong style={{ color: '#f4f4f2' }}>{c.name}</strong>
                              </div>
                            </td>
                            <td style={{ color: '#999' }}>
                              <div>{c.email}</div>
                              {c.phone && <div style={{ fontSize: '11px', color: '#777' }}>{c.phone}</div>}
                            </td>
                            <td><span className="admin-tag-pill">{c.city || 'Medellín'}</span></td>
                            <td className="admin-tabular" style={{ fontWeight: '600' }}>{c.orderCount} {c.orderCount === 1 ? 'pedido' : 'pedidos'}</td>
                            <td className="admin-tabular" style={{ fontWeight: '700', color: '#f4f4f2' }}>{formatMoney(c.totalSpent)}</td>
                            <td style={{ color: '#999' }}>{c.lastOrderDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {totalCustomerPages > 1 && (
                  <div className="admin-pagination">
                    <span className="admin-tabular">
                      Página {customersPage} de {totalCustomerPages} ({filteredCustomers.length} clientes)
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="admin-btn-outline is-compact"
                        disabled={customersPage === 1}
                        onClick={() => setCustomersPage(p => Math.max(1, p - 1))}
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        className="admin-btn-outline is-compact"
                        disabled={customersPage === totalCustomerPages}
                        onClick={() => setCustomersPage(p => Math.min(totalCustomerPages, p + 1))}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==============================================================
              VISTA 6: VENTAS (DESGLOSE FINANCIERO & RECAUDO)
              ============================================================== */}
          {activeTab === 'sales' && (
            <div className="admin-view-animated admin-view-stack">
              <section className="admin-welcome admin-report-heading" aria-labelledby="admin-sales-title">
                <div>
                  <span className="admin-eyebrow">SAUZ / RESULTADOS</span>
                  <h1 id="admin-sales-title">ANALÍTICA FINANCIERA.</h1>
                  <p>Desglose de ingresos confirmados, órdenes canceladas y distribución por medio de pago.</p>
                </div>
                <div className="admin-report-heading-action">
                  <span className="admin-date-current">{quickPeriodLabel}</span>
                </div>
              </section>

              <div className="admin-metrics-grid">
                <article className="admin-metric">
                  <div><span>Ventas brutas</span><DollarSign size={18} aria-hidden="true" /></div>
                  <strong className="admin-tabular">{formatMoney(periodGrossRevenue)}</strong>
                  <p>Incluye {periodOrders.length} órdenes registradas en el período.</p>
                </article>

                <article className="admin-metric">
                  <div><span>Ventas netas confirmadas</span><TrendingUp size={18} aria-hidden="true" /></div>
                  <strong className="admin-tabular is-positive">{formatMoney(periodNetRevenue)}</strong>
                  <p>{periodValidOrders.length} órdenes válidas (excluye canceladas).</p>
                </article>

                <article className="admin-metric">
                  <div><span>Promedio por pedido</span><CreditCard size={18} aria-hidden="true" /></div>
                  <strong className="admin-tabular">{formatMoney(periodAverageOrderValue)}</strong>
                  <p>Ticket promedio sobre ventas confirmadas.</p>
                </article>

                <article className="admin-metric">
                  <div><span>Volumen cancelado</span><XCircle size={18} aria-hidden="true" /></div>
                  <strong className="admin-tabular is-danger">{formatMoney(periodCancelledRevenue)}</strong>
                  <p>{periodCancelledOrders.length} pedido(s) dados de baja en el período.</p>
                </article>
              </div>

              {/* Métodos de Pago */}
              <section className="admin-panel-card" aria-labelledby="admin-payments-title">
                <div className="admin-panel-head">
                  <div>
                    <h4 id="admin-payments-title">Distribución por medio de pago</h4>
                    <p>Recaudo neto confirmado por canal durante {quickPeriodLabel.toLowerCase()}.</p>
                  </div>
                  <span className="admin-panel-meta admin-tabular">Neto total histórico: {formatMoney(totalNetRevenue)}</span>
                </div>
                <div className="admin-payment-grid">
                  {[
                    { method: 'Tarjeta de Crédito / Débito', key: 'card' },
                    { method: 'Transferencia Bancolombia / Nequi', key: 'transfer' },
                    { method: 'Pago Contra Entrega en Efectivo', key: 'cash' }
                  ].map(m => {
                    const matchOrders = periodValidOrders.filter(o => (o.payment?.method || 'card') === m.key);
                    const sum = matchOrders.reduce((acc, o) => acc + (o.total || 0), 0);
                    const pct = periodNetRevenue > 0 ? Math.round((sum / periodNetRevenue) * 100) : 0;
                    return (
                      <article key={m.key} className="admin-payment-card">
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#b4b4b4' }}>
                          {m.method}
                        </span>
                        <strong className="admin-tabular" style={{ fontSize: '24px', letterSpacing: '-0.03em', color: '#f4f4f2' }}>
                          {formatMoney(sum)}
                        </strong>
                        <div className="admin-progress-track">
                          <div className="admin-progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="admin-tabular" style={{ fontSize: '11px', color: '#888' }}>
                          {matchOrders.length} transacción(es) · {pct}% del período
                        </span>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* Tabla de movimientos del período */}
              <div className="admin-table-card">
                <div className="admin-panel-head" style={{ padding: '22px 24px 0', marginBottom: '14px' }}>
                  <div>
                    <h4>Detalle de ventas del período</h4>
                    <p>Órdenes contabilizadas durante {quickPeriodLabel.toLowerCase()}.</p>
                  </div>
                  <span className="admin-panel-meta admin-tabular">{periodOrders.length} movimiento(s)</span>
                </div>
                {periodOrders.length === 0 ? (
                  <div className="admin-empty-state">
                    <DollarSign size={28} aria-hidden="true" />
                    <h4>Sin movimientos en este período</h4>
                    <p>Selecciona un rango más amplio en la barra superior para consultar transacciones.</p>
                  </div>
                ) : (
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Pedido</th>
                          <th>Fecha</th>
                          <th>Cliente</th>
                          <th>Medio de pago</th>
                          <th>Estado</th>
                          <th style={{ textAlign: 'right' }}>Valor (COP)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {periodOrders.slice(0, 12).map(ord => (
                          <tr key={ord.orderId}>
                            <td style={{ fontWeight: '700', color: '#f4f4f2' }}>{ord.orderId}</td>
                            <td style={{ color: '#999' }}>{ord.date}</td>
                            <td>{ord.customer?.name}</td>
                            <td>{ord.payment?.method === 'card' ? 'Tarjeta' : (ord.payment?.method === 'transfer' ? 'Transferencia' : 'Efectivo')}</td>
                            <td>{renderOrderStatusBadge(ord.orderStatus)}</td>
                            <td className="admin-tabular" style={{ textAlign: 'right', fontWeight: '700', color: ord.orderStatus === 'Cancelado' ? '#ff4d57' : '#f4f4f2' }}>
                              {formatMoney(ord.total)}
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

          {/* ==============================================================
              VISTA 7: REPORTES (MÉTRICAS & EXPORTACIÓN)
              ============================================================== */}
          {activeTab === 'reports' && (
            <div className="admin-view-animated admin-view-stack">
              <section className="admin-welcome admin-report-heading" aria-labelledby="admin-reports-title">
                <div>
                  <span className="admin-eyebrow">SAUZ / REPORTES</span>
                  <h1 id="admin-reports-title">REPORTES Y EXPORTACIÓN.</h1>
                  <p>Descarga registros operativos en CSV y consulta el rendimiento comercial por categoría.</p>
                </div>
              </section>

              <section className="admin-panel-card" aria-labelledby="admin-export-title">
                <div className="admin-panel-head">
                  <div>
                    <h4 id="admin-export-title">Centro de informes</h4>
                    <p>Descarga en formato CSV plano los registros operativos de ventas e inventario para auditoría contable.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="admin-primary-action"
                    onClick={exportOrdersToCSV}
                  >
                    <Download size={16} aria-hidden="true" />
                    <span>Exportar libro de pedidos (CSV)</span>
                  </button>

                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={exportInventoryToCSV}
                  >
                    <Download size={16} aria-hidden="true" />
                    <span>Exportar existencias en bodega (CSV)</span>
                  </button>
                </div>
              </section>

              {/* Tabla de Rendimiento por Categoría */}
              <div className="admin-table-card">
                <div className="admin-panel-head" style={{ padding: '22px 24px 0', marginBottom: '14px' }}>
                  <div>
                    <h4>Rendimiento comercial por categoría</h4>
                    <p>Totales históricos acumulados sobre pedidos no cancelados.</p>
                  </div>
                  <span className="admin-panel-meta admin-tabular">{categorySummary.length} categorías · {formatMoney(totalNetRevenue)}</span>
                </div>
                <div className="admin-table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Categoría</th>
                        <th>Modelos activos</th>
                        <th>Unidades en bodega</th>
                        <th>Participación</th>
                        <th style={{ textAlign: 'right' }}>Ingresos generados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorySummary.map(cat => {
                        const share = totalNetRevenue > 0 ? Math.round((cat.revenue / totalNetRevenue) * 100) : 0;
                        return (
                          <tr key={cat.category}>
                            <td style={{ fontWeight: '700', color: '#f4f4f2' }}>{cat.category}</td>
                            <td className="admin-tabular" style={{ color: '#999' }}>{cat.productCount} modelo(s)</td>
                            <td className="admin-tabular">{cat.stockUnits} uds</td>
                            <td>
                              <div className="admin-share-cell">
                                <div className="admin-progress-track">
                                  <div className="admin-progress-fill" style={{ width: `${share}%` }} />
                                </div>
                                <span className="admin-tabular" style={{ fontSize: '12px', color: '#a6a6a6', minWidth: '34px' }}>{share}%</span>
                              </div>
                            </td>
                            <td className="admin-tabular" style={{ textAlign: 'right', fontWeight: '700', color: '#f4f4f2' }}>{formatMoney(cat.revenue)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              VISTA 8: CONFIGURACIÓN (AJUSTES DE LA MARCA)
              ============================================================== */}
          {activeTab === 'settings' && (
            <div className="admin-view-animated admin-view-stack">
              <section className="admin-welcome admin-report-heading" aria-labelledby="admin-settings-title">
                <div>
                  <span className="admin-eyebrow">SAUZ / PREFERENCIAS</span>
                  <h1 id="admin-settings-title">AJUSTES DE LA TIENDA.</h1>
                  <p>Parámetros operativos, tributarios y logísticos vigentes para Sauz Store Colombia.</p>
                </div>
                <div className="admin-report-heading-action">
                  <button
                    type="button"
                    className="admin-primary-action"
                    onClick={() => showToast('Parámetros corporativos validados correctamente')}
                  >
                    Validar parámetros
                  </button>
                </div>
              </section>

              <div className="admin-dashboard-split">
                <div className="admin-table-card">
                  <div className="admin-panel-head" style={{ padding: '22px 24px 0', marginBottom: '14px' }}>
                    <div>
                      <h4>Identidad y facturación</h4>
                      <p>Parámetros comerciales y fiscales aplicados al checkout.</p>
                    </div>
                  </div>
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Parámetro</th>
                          <th>Valor vigente</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: '600', color: '#f4f4f2' }}>Nombre comercial</td>
                          <td>Sauz Store Colombia</td>
                          <td><span className="admin-status-pill is-success">Activo</span></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', color: '#f4f4f2' }}>Moneda operativa</td>
                          <td className="admin-tabular">COP ($ Peso Colombiano)</td>
                          <td><span className="admin-status-pill is-neutral">COP</span></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', color: '#f4f4f2' }}>Impuesto (IVA)</td>
                          <td className="admin-tabular">16% incluido en total</td>
                          <td><span className="admin-status-pill is-info">Vigente</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="admin-table-card">
                  <div className="admin-panel-head" style={{ padding: '22px 24px 0', marginBottom: '14px' }}>
                    <div>
                      <h4>Logística y despacho</h4>
                      <p>Centro de distribución y tiempos de entrega nacional.</p>
                    </div>
                  </div>
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Parámetro</th>
                          <th>Valor vigente</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: '600', color: '#f4f4f2' }}>Bodega principal</td>
                          <td>Calle 10 # 40-20, El Poblado, Medellín</td>
                          <td><span className="admin-status-pill is-success">Operativa</span></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', color: '#f4f4f2' }}>Plazo de entrega</td>
                          <td>2 a 4 días hábiles nacionales</td>
                          <td><span className="admin-status-pill is-neutral">Nacional</span></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', color: '#f4f4f2' }}>Umbral de alerta stock</td>
                          <td className="admin-tabular">≤ {lowStockThreshold} unidades por talla</td>
                          <td><span className="admin-status-pill is-warning">Monitoreado</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==============================================================
          MODAL: CREAR / EDITAR PRENDA DE CATÁLOGO
          ============================================================== */}
      {isCreateProductModalOpen && (() => {
        const formVariants = productForm.variantsList || [];
        const totalFormStock = formVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
        const galleryOptions = [
          { value: '/Productos/jordan_Blanca.png', label: 'Camisa Jordan Blanca' },
          { value: '/Productos/Jordan_negra.png', label: 'Camisa Jordan Negra' },
          { value: '/Productos/hellstart_negra.png', label: 'Camisa Hellstar' },
          { value: '/Productos/moon.png', label: 'Camisa Moon' },
          { value: '/Productos/Ungd.png', label: 'Camisa Undg' },
          { value: '/Productos/letras_negra.png', label: 'Camisa Letras' },
          { value: '/Productos/Monastery_lado1.png', label: 'Hoodie Monastery' },
          { value: '/Productos/hoodie_negro.png', label: 'Hoodie Estrella' },
          { value: '/Productos/hoddie_blanco3.png', label: 'Hoodie Blanco Estrella' },
          { value: '/Productos/hoodie_negro2.png', label: 'Hoodie Negro Estampado' },
          { value: '/Productos/hodie_Blanco2.png', label: 'Hoodie Angel' },
          { value: '/Productos/Hugo_sueter.png', label: 'Hoodie Hugo' }
        ];
        const isCustomImage = productForm.image && !galleryOptions.some(o => o.value === productForm.image);

        return (
          <div role="dialog" aria-modal="true" className="admin-modal-backdrop">
            <div className="admin-modal-card is-product">
              <div className="admin-modal-header">
                <div>
                  <span className="admin-eyebrow">SAUZ / CATÁLOGO</span>
                  <h3 style={{ marginTop: '6px' }}>
                    {editingProduct ? 'Editar prenda' : 'Nueva prenda de colección'}
                  </h3>
                </div>
                <button
                  type="button"
                  className="admin-modal-close"
                  aria-label="Cerrar modal de producto"
                  onClick={() => setIsCreateProductModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="admin-product-modal-grid">
                  {/* Columna izquierda: Datos, precio y tallas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <section className="admin-form-section">
                      <div className="admin-form-section-head">
                        <h4>1. Información básica</h4>
                        <span>Datos visibles en el catálogo</span>
                      </div>

                      <label className="admin-field">
                        Nombre de la prenda *
                        <input
                          type="text"
                          required
                          placeholder="Ej. Hoodie Nike Tech Fleece Negro"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        />
                      </label>

                      <div className="admin-form-grid">
                        <label className="admin-field">
                          Marca
                          <input
                            placeholder="Ej. Nike, Adidas, SAUZ"
                            value={productForm.brand || ''}
                            onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                          />
                        </label>
                        <label className="admin-field">
                          Categoría *
                          <select
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          >
                            <option value="Camisetas">Camisetas</option>
                            <option value="Sudaderas">Sudaderas</option>
                            <option value="Chaquetas">Chaquetas</option>
                            <option value="Pantalones">Pantalones</option>
                            <option value="Zapatillas">Zapatillas</option>
                            <option value="Gorras">Gorras</option>
                            <option value="Conjuntos">Conjuntos</option>
                            <option value="Accesorios">Accesorios</option>
                          </select>
                        </label>
                      </div>

                      <div className="admin-form-grid">
                        <label className="admin-field">
                          Subcategoría (opcional)
                          <input
                            placeholder="Ej. Oversize, Running"
                            value={productForm.subcategory || ''}
                            onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                          />
                        </label>
                        <label className="admin-field">
                          Colores disponibles (opcional)
                          <input
                            type="text"
                            placeholder="Negro, Blanco, Gris"
                            value={productForm.colors || ''}
                            onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                          />
                        </label>
                      </div>
                    </section>

                    <section className="admin-form-section">
                      <div className="admin-form-section-head">
                        <h4>2. Precio y venta</h4>
                        {Number(productForm.price) > 0 && (
                          <span className="admin-price-hint">{formatMoney(Number(productForm.price))}</span>
                        )}
                      </div>

                      <div className="admin-form-grid">
                        <label className="admin-field">
                          Precio de venta (COP) *
                          <input
                            type="number"
                            min="1000"
                            step="1000"
                            placeholder="165000"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          />
                        </label>
                        <label className="admin-field">
                          Precio anterior opcional (COP)
                          <input
                            type="number"
                            min="1000"
                            step="1000"
                            placeholder="195000"
                            value={productForm.previousPrice || ''}
                            onChange={(e) => setProductForm({ ...productForm, previousPrice: e.target.value })}
                          />
                        </label>
                      </div>

                      <label className="admin-toggle-card">
                        <input
                          type="checkbox"
                          checked={Boolean(productForm.commercial)}
                          onChange={(e) => setProductForm({ ...productForm, commercial: e.target.checked })}
                        />
                        <span>
                          <strong>Habilitar para compra en la tienda</strong>
                          <small>Si está activo y tiene precio y stock, los clientes podrán agregarla a la bolsa.</small>
                        </span>
                      </label>
                    </section>

                    <section className="admin-form-section">
                      <div className="admin-form-section-head">
                        <h4>3. Tallas y existencias</h4>
                        <span className="admin-tabular" style={{ color: '#f4f4f2', fontWeight: '700' }}>
                          Stock total: {totalFormStock} uds
                        </span>
                      </div>

                      <div className="admin-variant-list">
                        {formVariants.map((row, idx) => (
                          <div key={row.id || idx} className="admin-variant-row">
                            <input
                              type="text"
                              aria-label={`Talla ${idx + 1}`}
                              placeholder="Talla (ej. M, 40, Única)"
                              value={row.size}
                              onChange={(e) => {
                                const next = [...formVariants];
                                next[idx] = { ...next[idx], size: e.target.value };
                                setProductForm({ ...productForm, variantsList: next });
                              }}
                            />
                            <input
                              type="number"
                              min="0"
                              aria-label={`Unidades para talla ${row.size || idx + 1}`}
                              placeholder="Cantidad"
                              value={row.stock}
                              onChange={(e) => {
                                const next = [...formVariants];
                                next[idx] = { ...next[idx], stock: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0) };
                                setProductForm({ ...productForm, variantsList: next });
                              }}
                            />
                            <button
                              type="button"
                              className="admin-icon-btn is-danger"
                              aria-label={`Quitar talla ${row.size || idx + 1}`}
                              disabled={formVariants.length <= 1}
                              onClick={() => {
                                setProductForm({
                                  ...productForm,
                                  variantsList: formVariants.filter((_, i) => i !== idx)
                                });
                              }}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="admin-variant-presets">
                        <button
                          type="button"
                          className="admin-btn-outline is-compact"
                          onClick={() => {
                            setProductForm({
                              ...productForm,
                              variantsList: [
                                ...formVariants,
                                { id: `size-${Date.now().toString(36)}`, size: '', stock: 0 }
                              ]
                            });
                          }}
                        >
                          <Plus size={13} aria-hidden="true" />
                          <span>Agregar talla</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn-outline is-compact"
                          onClick={() => setProductForm({ ...productForm, variantsList: DEFAULT_VARIANTS.map(v => ({ ...v })) })}
                        >
                          Usar S · M · L · XL
                        </button>
                        <button
                          type="button"
                          className="admin-btn-outline is-compact"
                          onClick={() => setProductForm({ ...productForm, variantsList: [{ id: 'size-unica', size: 'Única', stock: totalFormStock }] })}
                        >
                          Talla única
                        </button>
                      </div>
                    </section>
                  </div>

                  {/* Columna derecha: Fotografía y descripción */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <section className="admin-image-panel">
                      <div className="admin-form-section-head">
                        <h4>Imagen de la prenda *</h4>
                        <span>Vista previa</span>
                      </div>

                      <div className="admin-image-preview">
                        <ProductImage mode='card' src={productForm.image} alt={productForm.name || 'Vista previa'} />
                      </div>

                      <label className="admin-upload-dropzone">
                        <Upload size={18} aria-hidden="true" />
                        <strong>{uploadingImage ? 'Subiendo imagen...' : 'Adjuntar imagen desde tu computador'}</strong>
                        <span>PNG, JPG, WEBP o AVIF (máx. 5 MB)</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/avif"
                          disabled={uploadingImage}
                          onChange={handleProductImageUpload}
                        />
                      </label>

                      <label className="admin-field">
                        O elegir imagen existente
                        <select
                          value={productForm.image}
                          onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                        >
                          {isCustomImage && (
                            <option value={productForm.image}>
                              Imagen adjuntada ({productForm.image.split('/').pop()})
                            </option>
                          )}
                          {galleryOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </label>
                    </section>

                    <section className="admin-form-section">
                      <label className="admin-field">
                        Descripción de la prenda
                        <textarea
                          rows="4"
                          placeholder="Materiales, gramaje, corte y detalles destacados..."
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        />
                      </label>
                    </section>
                  </div>
                </div>

                <div className="admin-modal-actions">
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={() => setIsCreateProductModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="admin-primary-action"
                    disabled={uploadingImage}
                  >
                    {editingProduct ? 'Guardar cambios' : 'Crear prenda'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ==============================================================
          MODAL: DETALLES COMPLETOS DE PEDIDO
          ============================================================== */}
      {selectedOrderDetails && (
        <div role="dialog" aria-modal="true" className="admin-modal-backdrop">
          <div className="admin-modal-card is-wide">
            <div className="admin-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h3>{selectedOrderDetails.orderId}</h3>
                  {renderOrderStatusBadge(selectedOrderDetails.orderStatus)}
                </div>
                <span style={{ fontSize: '12px', color: '#999', display: 'block', marginTop: '6px' }}>
                  Fecha de compra: {selectedOrderDetails.date}
                </span>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                aria-label="Cerrar detalles del pedido"
                onClick={() => setSelectedOrderDetails(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Datos del Cliente y Despacho */}
            <div style={{ backgroundColor: '#191919', border: '1px solid #2d2d2d', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <span className="admin-eyebrow" style={{ display: 'block', marginBottom: '12px' }}>
                INFORMACIÓN DE ENTREGA
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#888', display: 'block', fontSize: '11px', marginBottom: '2px' }}>Comprador</span>
                  <strong style={{ color: '#f4f4f2' }}>{selectedOrderDetails.customer?.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#888', display: 'block', fontSize: '11px', marginBottom: '2px' }}>Correo</span>
                  <span style={{ color: '#e5e5e5' }}>{selectedOrderDetails.customer?.email}</span>
                </div>
                <div>
                  <span style={{ color: '#888', display: 'block', fontSize: '11px', marginBottom: '2px' }}>Teléfono</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{selectedOrderDetails.customer?.phone || 'No registrado'}</span>
                    {selectedOrderDetails.customer?.phone && (
                      <a
                        href={`https://wa.me/${selectedOrderDetails.customer.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(selectedOrderDetails.customer.name)}%2C%20te%20escribimos%20de%20Sauz%20Store%20sobre%20tu%20pedido%20${selectedOrderDetails.orderId}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#4ade80', fontWeight: '600', textDecoration: 'none', fontSize: '12px' }}
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#888', display: 'block', fontSize: '11px', marginBottom: '2px' }}>Dirección y ciudad</span>
                  <span>{selectedOrderDetails.customer?.address}, {selectedOrderDetails.customer?.city || 'Medellín'}</span>
                </div>
              </div>
            </div>

            {/* Prendas Llevadas */}
            <div style={{ marginBottom: '20px' }}>
              <span className="admin-eyebrow" style={{ display: 'block', marginBottom: '10px' }}>
                PRENDAS EN ESTA ORDEN ({(selectedOrderDetails.items || []).length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedOrderDetails.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '10px 12px',
                      backgroundColor: '#191919',
                      border: '1px solid #2d2d2d',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <ProductImage mode='thumb'
                        src={item.image}
                        alt={item.name}
                        style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#0b0b0b', border: '1px solid #262626', flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ fontSize: '13px', color: '#f4f4f2', display: 'block' }}>{item.name}{item.size ? ` · Talla ${item.size}` : ''}</strong>
                        <span className="admin-tabular" style={{ fontSize: '11px', color: '#999' }}>
                          {item.quantity} ud(s) × {formatMoney(item.price)}
                        </span>
                      </div>
                    </div>
                    <span className="admin-tabular" style={{ fontWeight: '700', fontSize: '13px', color: '#f4f4f2', flexShrink: 0 }}>
                      {formatMoney(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen Financiero de la Orden */}
            <div style={{ borderTop: '1px solid #2b2b2b', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999' }}>
                <span>Subtotal</span>
                <span className="admin-tabular">{formatMoney(selectedOrderDetails.subtotal || (selectedOrderDetails.total * 0.84))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999' }}>
                <span>IVA (16%)</span>
                <span className="admin-tabular">{formatMoney(selectedOrderDetails.tax || (selectedOrderDetails.total * 0.16))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: '#f4f4f2', borderTop: '1px solid #2b2b2b', paddingTop: '10px' }}>
                <span>Total facturado</span>
                <span className="admin-tabular">{formatMoney(selectedOrderDetails.total)}</span>
              </div>
            </div>

            <OrderShippingEditor key={selectedOrderDetails.orderId} order={selectedOrderDetails} onSaved={setSelectedOrderDetails} />

            {/* Historial de Seguimiento */}
            <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #2b2b2b' }}>
              <strong style={{ fontSize: '13px', color: '#f4f4f2', display: 'block', marginBottom: '10px' }}>
                Historial de seguimiento
              </strong>
              {selectedOrderDetails.trackingHistory && selectedOrderDetails.trackingHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {selectedOrderDetails.trackingHistory.map((step, idx) => (
                    <div key={idx} style={{ fontSize: '12px', background: '#191919', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid var(--sauz-red)' }}>
                      <div style={{ fontWeight: '700', color: '#f4f4f2' }}>{step.status} · <small style={{ color: '#888', fontWeight: '500' }}>{step.dateFormatted || step.timestamp}</small></div>
                      {step.note && <div style={{ color: '#a6a6a6', marginTop: '3px' }}>{step.note}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '12px' }}>Sin eventos de seguimiento registrados aún.</span>
              )}

              {/* Selector de Estado y Nota de Despacho */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: '#a6a6a6', fontWeight: '600' }}>Nuevo estado operativo</span>
                  <select
                    id="adminOrderStatusSelect"
                    className="admin-inline-select"
                    defaultValue={selectedOrderDetails.orderStatus || 'En proceso'}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aceptado">Aceptado</option>
                    <option value="En proceso">En preparación</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Nota de seguimiento (ej. Guía #982137 de Envía)"
                    value={orderTrackingNote}
                    onChange={(e) => setOrderTrackingNote(e.target.value)}
                    style={{
                      flex: '1 1 220px',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #3a3a3a',
                      background: '#111',
                      color: '#f4f4f2',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn-danger-solid"
                    onClick={async () => {
                      const sel = document.getElementById('adminOrderStatusSelect');
                      const newStatus = sel ? sel.value : selectedOrderDetails.orderStatus;
                      const res = await updateOrderStatus(selectedOrderDetails.orderId, newStatus, orderTrackingNote);
                      if (res && res.order) {
                        setSelectedOrderDetails(res.order);
                      }
                      setOrderTrackingNote('');
                    }}
                  >
                    Actualizar estado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
          ============================================================== */}
      {deleteConfirmProduct && (
        <div role="dialog" aria-modal="true" className="admin-modal-backdrop" style={{ zIndex: 10020 }}>
          <div className="admin-modal-card is-narrow">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff4d57', marginBottom: '12px' }}>
              <AlertCircle size={20} aria-hidden="true" />
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Confirmar eliminación</h4>
            </div>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#a6a6a6', lineHeight: 1.6 }}>
              ¿Estás seguro de que deseas eliminar la prenda <strong style={{ color: '#f4f4f2' }}>"{deleteConfirmProduct.name}"</strong>? Esta acción removerá la referencia del catálogo y de bodega.
            </p>
            <div className="admin-modal-actions" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="admin-btn-outline"
                onClick={() => setDeleteConfirmProduct(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="admin-btn-danger-solid"
                onClick={handleExecuteDeleteProduct}
              >
                Eliminar prenda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos responsivos */}
      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar-desktop {
            display: none !important;
          }
          .admin-sidebar-mobile-open {
            display: flex !important;
            position: fixed !important;
            inset: 0 auto 0 0 !important;
            box-shadow: 0 0 50px rgba(0,0,0,0.4) !important;
          }
          .admin-mobile-toggle-btn {
            display: flex !important;
          }
          .admin-topbar .admin-period-controls {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
