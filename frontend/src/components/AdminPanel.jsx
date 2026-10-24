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
  Layers
} from 'lucide-react';

// Dot activo animado con onda expansiva tipo radar de alta gama
const CustomActiveDot = (props) => {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill="#0A0A0A" fillOpacity={0.16} className="chart-pulse-ring" />
      <circle cx={cx} cy={cy} r={6.5} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={2.5} fill="#0A0A0A" />
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
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#A3A3A3', fontWeight: '600' }}>
            {data.fullDate || label}
          </span>
          <span className="chart-pulse-badge" />
        </div>

        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          {chartViewMode.startsWith('revenue')
            ? formatMoney(val)
            : `${val} ${val === 1 ? 'pedido' : 'pedidos'}`
          }
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.73rem', color: '#D4D4D4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Pedidos en la fecha:</span>
            <strong style={{ color: '#FFFFFF' }}>{data.orders}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Prendas vendidas:</span>
            <strong style={{ color: '#FFFFFF' }}>{data.units} uds</strong>
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

  // Filtros globales y por sección
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
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);

  // Formularios de producto
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Camisetas',
    price: '',
    stock: 15,
    description: '',
    image: '/Productos/jordan_Blanca.png'
  });

  // Estado para Módulo de Clientes
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // Reabastecimiento personalizado
  const [customRestockInputs, setCustomRestockInputs] = useState({});

  // Tooltip en gráfica
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);

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
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // Filtrado de pedidos según el período seleccionado
  const periodOrders = useMemo(() => {
    return orders.filter(o => {
      const time = o.timestamp || Date.now();
      if (periodFilter === 'today') return time >= startOfToday;
      if (periodFilter === '7days') return time >= sevenDaysAgo;
      if (periodFilter === '30days') return time >= thirtyDaysAgo;
      if (periodFilter === 'month') return time >= startOfMonth;
      return true;
    });
  }, [orders, periodFilter, startOfToday, sevenDaysAgo, thirtyDaysAgo, startOfMonth]);

  // Distinción estricta de ingresos: no sumar pedidos cancelados a ventas válidas
  const validOrders = useMemo(() => orders.filter(o => o.orderStatus !== 'Cancelado'), [orders]);
  const cancelledOrders = useMemo(() => orders.filter(o => o.orderStatus === 'Cancelado'), [orders]);
  const pendingOrders = useMemo(() => orders.filter(o => o.orderStatus === 'En proceso' || o.orderStatus === 'Pendiente'), [orders]);
  const deliveredOrders = useMemo(() => orders.filter(o => o.orderStatus === 'Entregado'), [orders]);

  // Métricas financieras
  const totalGrossRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalNetRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const cancelledRevenue = cancelledOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const todayRevenue = validOrders
    .filter(o => (o.timestamp || 0) >= startOfToday)
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const monthRevenue = validOrders
    .filter(o => (o.timestamp || 0) >= startOfMonth)
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const totalUnitsSold = validOrders.reduce((sum, o) => sum + (o.count || 0), 0);
  const averageOrderValue = validOrders.length > 0 ? Math.round(totalNetRevenue / validOrders.length) : 0;

  // Métricas de inventario
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  // Ventas agrupadas por categoría
  const categorySales = useMemo(() => {
    const map = {};
    validOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const cat = prod?.category || 'Camisetas';
        map[cat] = (map[cat] || 0) + (item.price * item.quantity);
      });
    });
    return map;
  }, [validOrders, products]);

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

  // Datos reactivos y dinámicos para la gráfica Recharts interactiva
  const chartData = useMemo(() => {
    if (periodFilter === 'today') {
      const slots = [
        { label: '08:00', fullDate: 'Hoy 08:00 AM', hStart: 0, hEnd: 10 },
        { label: '11:00', fullDate: 'Hoy 11:00 AM', hStart: 10, hEnd: 13 },
        { label: '14:00', fullDate: 'Hoy 02:00 PM', hStart: 13, hEnd: 16 },
        { label: '17:00', fullDate: 'Hoy 05:00 PM', hStart: 16, hEnd: 19 },
        { label: '20:00', fullDate: 'Hoy 08:00 PM', hStart: 19, hEnd: 22 },
        { label: 'Cierre', fullDate: 'Hoy Cierre', hStart: 22, hEnd: 24 }
      ];

      let running = 0;
      return slots.map(slot => {
        const slotOrders = validOrders.filter(o => {
          const d = new Date(o.timestamp || Date.now());
          const isToday = d.getTime() >= startOfToday;
          const h = d.getHours();
          return isToday && h >= slot.hStart && h < slot.hEnd;
        });

        const rev = slotOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        running += rev;
        const count = slotOrders.length;
        const units = slotOrders.reduce((sum, o) => sum + (o.count || (o.items || []).length || 0), 0);

        return {
          label: slot.label,
          fullDate: slot.fullDate,
          revenue: rev,
          revenue_accum: running,
          orders: count,
          units: units
        };
      });
    }

    if (periodFilter === '7days') {
      const points = [];
      let running = 0;
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dayEnd = dayStart + (24 * 60 * 60 * 1000);
        const dayName = i === 0 ? 'Hoy' : d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
        const fullDateName = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'long' });

        const dayOrders = validOrders.filter(o => {
          const t = o.timestamp || Date.now();
          return t >= dayStart && t < dayEnd;
        });

        const rev = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        running += rev;
        const count = dayOrders.length;
        const units = dayOrders.reduce((sum, o) => sum + (o.count || (o.items || []).length || 0), 0);

        points.push({
          label: dayName,
          fullDate: fullDateName,
          revenue: rev,
          revenue_accum: running,
          orders: count,
          units: units
        });
      }
      return points;
    }

    // Default: '30days' o 'month'
    const checkpoints = [
      { daysAgo: 24, label: '01 Oct', fullDate: '01 de Octubre' },
      { daysAgo: 18, label: '06 Oct', fullDate: '06 de Octubre' },
      { daysAgo: 12, label: '12 Oct', fullDate: '12 de Octubre' },
      { daysAgo: 7,  label: '17 Oct', fullDate: '17 de Octubre' },
      { daysAgo: 4,  label: '20 Oct', fullDate: '20 de Octubre' },
      { daysAgo: 2,  label: '22 Oct', fullDate: '22 de Octubre' },
      { daysAgo: 1,  label: '23 Oct', fullDate: '23 de Octubre' },
      { daysAgo: 0,  label: 'Hoy',    fullDate: 'Hoy (24 de Octubre)' }
    ];

    let runningAccum = 0;
    return checkpoints.map(cp => {
      let cpOrders = [];
      if (cp.daysAgo === 0) {
        cpOrders = validOrders.filter(o => (o.timestamp || 0) >= startOfToday);
      } else {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - cp.daysAgo);
        const dStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
        const dEnd = dStart + (24 * 60 * 60 * 1000);
        cpOrders = validOrders.filter(o => {
          const t = o.timestamp || 0;
          return t >= dStart && t < dEnd;
        });
      }

      const rev = cpOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      runningAccum += rev;
      const count = cpOrders.length;
      const units = cpOrders.reduce((sum, o) => sum + (o.count || (o.items || []).length || 0), 0);

      return {
        label: cp.label,
        fullDate: cp.fullDate,
        revenue: rev,
        revenue_accum: runningAccum,
        orders: count,
        units: units
      };
    });
  }, [validOrders, periodFilter, startOfToday]);

  // ==============================================================
  // ACCIONES DE PRODUCTO (CREAR / EDITAR / ELIMINAR / REABASTECER)
  // ==============================================================
  const handleOpenCreateProduct = () => {
    setProductForm({
      name: '',
      category: 'Camisetas',
      price: '',
      stock: 12,
      description: '',
      image: '/Productos/jordan_Blanca.png'
    });
    setEditingProduct(null);
    setIsCreateProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      stock: prod.stock,
      description: prod.description || '',
      image: prod.image
    });
    setIsCreateProductModalOpen(true);
  };

  const handleSaveProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price) {
      showToast('El nombre y el precio son obligatorios');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: productForm.name.trim(),
          category: productForm.category,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock, 10) || 0,
          description: productForm.description.trim(),
          image: productForm.image
        });
      } else {
        await createNewProduct({
          name: productForm.name.trim(),
          category: productForm.category,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock, 10) || 0,
          description: productForm.description.trim(),
          image: productForm.image
        });
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

  const handleQuickRestock = async (productId, amount) => {
    const qty = parseInt(amount, 10);
    if (!qty || qty <= 0) return;
    await restockProduct(productId, qty);
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
  // FILTRADO Y PAGINACIÓN DE PEDIDOS
  // ==============================================================
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = orderSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        (o.orderId || '').toString().toLowerCase().includes(q) ||
        (o.customer?.name || '').toLowerCase().includes(q) ||
        (o.customer?.email || '').toLowerCase().includes(q) ||
        (o.customer?.city || '').toLowerCase().includes(q);

      const matchesStatus = orderStatusFilter === 'Todos' ||
        (o.orderStatus || 'En proceso').toLowerCase() === orderStatusFilter.toLowerCase();

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
        (p.category || '').toLowerCase().includes(q) ||
        `sku-${p.id}`.toLowerCase().includes(q);

      const matchesCategory = productCategoryFilter === 'Todas' || p.category === productCategoryFilter;

      let matchesStock = true;
      if (productStockFilter === 'in_stock') matchesStock = p.stock > 5;
      if (productStockFilter === 'low_stock') matchesStock = p.stock > 0 && p.stock <= 5;
      if (productStockFilter === 'out_of_stock') matchesStock = p.stock === 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, productSearch, productCategoryFilter, productStockFilter]);

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
    let bg = '#F6F6F6';
    let text = '#171717';
    let border = '#E7E7E7';
    let Icon = Clock;

    if (st === 'Entregado') {
      bg = '#F0FDF4';
      text = '#15803D';
      border = '#BBF7D0';
      Icon = PackageCheck;
    } else if (st === 'Enviado') {
      bg = '#EFF6FF';
      text = '#1D4ED8';
      border = '#BFDBFE';
      Icon = Truck;
    } else if (st === 'En proceso') {
      bg = '#FFFBEB';
      text = '#B45309';
      border = '#FDE68A';
      Icon = Clock;
    } else if (st === 'Cancelado') {
      bg = '#FEF2F2';
      text = '#B91C1C';
      border = '#FECACA';
      Icon = XCircle;
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '0.72rem',
          fontWeight: '600',
          letterSpacing: '0.3px',
          backgroundColor: bg,
          color: text,
          border: `1px solid ${border}`
        }}
      >
        <Icon size={12} strokeWidth={2} />
        <span>{st}</span>
      </span>
    );
  };

  // Helper para insignias de stock
  const renderStockBadge = (stock) => {
    if (stock === 0) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '600',
            backgroundColor: '#FEF2F2',
            color: '#B91C1C',
            border: '1px solid #FECACA'
          }}
        >
          <AlertCircle size={11} />
          <span>Agotado (0)</span>
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '600',
            backgroundColor: '#FFFBEB',
            color: '#B45309',
            border: '1px solid #FDE68A'
          }}
        >
          <Clock size={11} />
          <span>Bajo ({stock})</span>
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: '600',
          backgroundColor: '#F0FDF4',
          color: '#15803D',
          border: '1px solid #BBF7D0'
        }}
      >
        <CheckCircle2 size={11} />
        <span>{stock} unidades</span>
      </span>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F6F6F6',
        color: '#171717',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* ==============================================================
          BARRA LATERAL / SIDEBAR CORPORATIVO MINIMALISTA
          ============================================================== */}
      <aside
        style={{
          width: sidebarCollapsed ? '72px' : '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E7E7E7',
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
        className={mobileMenuOpen ? 'admin-sidebar-mobile-open' : 'admin-sidebar-desktop'}
      >
        <div>
          {/* Cabecera del Sidebar */}
          <div
            style={{
              height: '68px',
              padding: sidebarCollapsed ? '0 16px' : '0 22px',
              borderBottom: '1px solid #E7E7E7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between'
            }}
          >
            {!sidebarCollapsed && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#0A0A0A', borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.86rem', fontWeight: '800', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                    SAUZ
                  </span>
                </div>
                <span style={{ fontSize: '0.66rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#737373', display: 'block', marginTop: '2px' }}>
                  Administración
                </span>
              </div>
            )}

            {sidebarCollapsed && (
              <span style={{ fontSize: '0.9rem', fontWeight: '900', letterSpacing: '1px' }}>S</span>
            )}

            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
              style={{
                background: 'none',
                border: 'none',
                color: '#737373',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.15s, color 0.15s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#F6F6F6';
                e.currentTarget.style.color = '#171717';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#737373';
              }}
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Menú de Navegación */}
          <nav style={{ padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'products', label: 'Productos', icon: ShoppingBag },
              { id: 'inventory', label: 'Inventario', icon: Boxes, badge: lowStockProducts.length > 0 ? lowStockProducts.length : null },
              { id: 'orders', label: 'Pedidos', icon: ClipboardList, badge: pendingOrders.length > 0 ? pendingOrders.length : null },
              { id: 'customers', label: 'Clientes', icon: Users },
              { id: 'sales', label: 'Ventas', icon: DollarSign },
              { id: 'reports', label: 'Reportes', icon: BarChart3 },
              { id: 'settings', label: 'Configuración', icon: Settings }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                    padding: sidebarCollapsed ? '10px 0' : '9px 12px',
                    borderRadius: '6px',
                    backgroundColor: isActive ? '#0A0A0A' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#737373',
                    border: 'none',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>

                  {!sidebarCollapsed && item.badge !== null && item.badge !== undefined && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        padding: '2px 7px',
                        borderRadius: '10px',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F6F6F6',
                        color: isActive ? '#FFFFFF' : '#171717',
                        border: isActive ? 'none' : '1px solid #E7E7E7'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Zona Inferior: Perfil y Cierre de Sesión */}
        <div style={{ padding: '14px 10px', borderTop: '1px solid #E7E7E7' }}>
          {/* Botón Ir a Tienda */}
          <button
            type="button"
            onClick={handleGoToStore}
            title={sidebarCollapsed ? 'Ver tienda pública' : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: '#737373',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '6px',
              transition: 'background-color 0.15s, color 0.15s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#F6F6F6';
              e.currentTarget.style.color = '#171717';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#737373';
            }}
          >
            <ExternalLink size={16} />
            {!sidebarCollapsed && <span>Ir a la tienda</span>}
          </button>

          {/* Tarjeta de Perfil / Logout */}
          <div
            style={{
              padding: sidebarCollapsed ? '8px 0' : '10px 12px',
              backgroundColor: '#F6F6F6',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between',
              gap: '8px'
            }}
          >
            {!sidebarCollapsed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    backgroundColor: '#0A0A0A',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    flexShrink: 0
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#171717', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {user?.name || 'Administrador'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#737373', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {user?.email || 'admin@sauzstore.com'}
                  </span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: '700'
                }}
              >
                A
              </div>
            )}

            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#737373',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s, background-color 0.15s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#DC2626';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#737373';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ==============================================================
          ÁREA PRINCIPAL DE TRABAJO (CABECERA + CONTENIDO)
          ============================================================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Cabecera Superior Corporativa */}
        <header
          style={{
            height: '68px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E7E7E7',
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="admin-mobile-toggle-btn"
              style={{
                background: 'none',
                border: '1px solid #E7E7E7',
                borderRadius: '6px',
                padding: '6px',
                color: '#171717',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Menu size={18} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#737373' }}>
                <span>Administración</span>
                <span>/</span>
                <span style={{ textTransform: 'capitalize', color: '#171717', fontWeight: '600' }}>
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'products' && 'Productos'}
                  {activeTab === 'inventory' && 'Inventario'}
                  {activeTab === 'orders' && 'Pedidos'}
                  {activeTab === 'customers' && 'Clientes'}
                  {activeTab === 'sales' && 'Ventas'}
                  {activeTab === 'reports' && 'Reportes'}
                  {activeTab === 'settings' && 'Configuración'}
                </span>
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '2px 0 0 0', letterSpacing: '-0.02em', color: '#171717' }}>
                {activeTab === 'dashboard' && 'Resumen Ejecutivo'}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Controles de período para métricas financieras */}
            {(activeTab === 'dashboard' || activeTab === 'sales' || activeTab === 'reports') && (
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#F6F6F6',
                  padding: '3px',
                  borderRadius: '6px',
                  border: '1px solid #E7E7E7'
                }}
                className="admin-period-controls"
              >
                {[
                  { id: 'today', label: 'Hoy' },
                  { id: '7days', label: '7 días' },
                  { id: '30days', label: '30 días' },
                  { id: 'month', label: 'Este mes' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriodFilter(p.id)}
                    style={{
                      padding: '5px 11px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: periodFilter === p.id ? '#FFFFFF' : 'transparent',
                      color: periodFilter === p.id ? '#171717' : '#737373',
                      fontSize: '0.74rem',
                      fontWeight: periodFilter === p.id ? '700' : '500',
                      cursor: 'pointer',
                      boxShadow: periodFilter === p.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Acción rápida según pestaña */}
            {activeTab === 'products' && (
              <button
                type="button"
                onClick={handleOpenCreateProduct}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#262626'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0A0A0A'}
              >
                <Plus size={15} />
                <span>Nueva Prenda</span>
              </button>
            )}

            {/* Menú de Notificaciones */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notificaciones"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  border: '1px solid #E7E7E7',
                  backgroundColor: '#FFFFFF',
                  color: '#171717',
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
                      backgroundColor: '#DC2626',
                      borderRadius: '50%'
                    }}
                  />
                )}
              </button>

              {notificationsOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '320px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E7E7E7',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                    padding: '16px',
                    zIndex: 200
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#171717' }}>Notificaciones Operativas</span>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {pendingOrders.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#737373' }}>No hay pedidos pendientes de despacho.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: '600' }}>
                        {pendingOrders.length} pedido(s) requieren atención:
                      </span>
                      {pendingOrders.slice(0, 3).map(po => (
                        <div
                          key={po.orderId}
                          onClick={() => {
                            setSelectedOrderDetails(po);
                            setNotificationsOpen(false);
                            setActiveTab('orders');
                          }}
                          style={{
                            padding: '8px 10px',
                            backgroundColor: '#F6F6F6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong style={{ color: '#171717' }}>{po.orderId}</strong>
                            <span style={{ color: '#737373' }}>{formatMoney(po.total)}</span>
                          </div>
                          <span style={{ color: '#737373', display: 'block', fontSize: '0.7rem' }}>{po.customer?.name}</span>
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
        <main style={{ padding: 'clamp(20px, 3.5vw, 40px)', flex: 1 }}>
          {/* ==============================================================
              VISTA 1: DASHBOARD (RESUMEN EJECUTIVO & INDICADORES FINANCIEROS)
              ============================================================== */}
          {activeTab === 'dashboard' && (
            <div className="admin-view-animated" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Grid de 6 Indicadores Financieros con Micro-interacciones */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                  gap: '16px'
                }}
              >
                {/* 1. Ingresos Netos Confirmados */}
                <div className="admin-kpi-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#737373' }}>
                      Ingresos Netos (COP)
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: '700', color: '#15803D', backgroundColor: '#F0FDF4', padding: '2px 6px', borderRadius: '4px' }}>
                      <ArrowUpRight size={12} /> +12.4%
                    </span>
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#171717', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    {formatMoney(totalNetRevenue)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#737373' }}>
                      Excluye pedidos cancelados ({cancelledOrders.length})
                    </span>
                    <svg width="48" height="18" viewBox="0 0 48 18">
                      <path d="M 2 15 Q 14 12, 22 9 T 36 6 T 46 2" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* 2. Ventas del Mes */}
                <div className="admin-kpi-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#737373' }}>
                      Ventas Este Mes
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: '700', color: '#15803D', backgroundColor: '#F0FDF4', padding: '2px 6px', borderRadius: '4px' }}>
                      <ArrowUpRight size={12} /> +8.0%
                    </span>
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#171717', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    {formatMoney(monthRevenue)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#737373' }}>
                      Octubre 2026 en curso
                    </span>
                    <svg width="48" height="18" viewBox="0 0 48 18">
                      <path d="M 2 14 Q 16 13, 26 8 T 38 7 T 46 3" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* 3. Valor Promedio por Pedido (AOV) */}
                <div className="admin-kpi-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#737373' }}>
                      Ticket Promedio (AOV)
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#737373', fontWeight: '600' }}>
                      Por orden
                    </span>
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#171717', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    {formatMoney(averageOrderValue)}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#737373', display: 'block', marginTop: '6px' }}>
                    Promedio de compra por cliente
                  </span>
                </div>

                {/* 4. Pedidos Totales & Pendientes (Interactivo) */}
                <div
                  className="admin-kpi-card"
                  onClick={() => setActiveTab('orders')}
                  style={{ cursor: 'pointer' }}
                  title="Clic para ir al módulo de pedidos"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#737373' }}>
                      Pedidos Realizados
                    </span>
                    {pendingOrders.length > 0 ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: '700', color: '#B45309', backgroundColor: '#FFFBEB', padding: '2px 6px', borderRadius: '4px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#B45309' }} />
                        {pendingOrders.length} por despachar
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#15803D', backgroundColor: '#F0FDF4', padding: '2px 6px', borderRadius: '4px' }}>
                        Al día
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#171717', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    {orders.length}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#737373' }}>
                      {deliveredOrders.length} entregados exitosamente
                    </span>
                    <ArrowRight size={13} color="#737373" />
                  </div>
                </div>

                {/* 5. Unidades de Prendas Vendidas */}
                <div
                  className="admin-kpi-card"
                  onClick={() => setActiveTab('products')}
                  style={{ cursor: 'pointer' }}
                  title="Clic para ver catálogo y productos"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#737373' }}>
                      Prendas Despachadas
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#737373', fontWeight: '600' }}>
                      Físico
                    </span>
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#171717', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    {totalUnitsSold}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#737373' }}>
                      Unidades totales vendidas
                    </span>
                    <ArrowRight size={13} color="#737373" />
                  </div>
                </div>

                {/* 6. Existencias Bajas o Críticas */}
                <div
                  className="admin-kpi-card"
                  onClick={() => {
                    setProductStockFilter('low_stock');
                    setActiveTab('inventory');
                  }}
                  style={{ cursor: 'pointer' }}
                  title="Clic para filtrar inventario con bajo stock"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#737373' }}>
                      Alertas de Stock
                    </span>
                    {lowStockProducts.length > 0 ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: '700', color: '#B91C1C', backgroundColor: '#FEF2F2', padding: '2px 6px', borderRadius: '4px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#B91C1C' }} />
                        {lowStockProducts.length} críticos
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: '700', color: '#15803D', backgroundColor: '#F0FDF4', padding: '2px 6px', borderRadius: '4px' }}>
                        <span className="chart-pulse-badge" /> Óptimo
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#171717', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    {lowStockProducts.length + outOfStockProducts.length}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#737373' }}>
                      Prendas con 5 o menos existencias
                    </span>
                    <ArrowRight size={13} color="#737373" />
                  </div>
                </div>
              </div>

              {/* Gráfica Recharts Interactiva Premium */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E7E7E7',
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
                    borderBottom: '1px solid #F0F0F0'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase', color: '#737373' }}>
                        Evolución Financiera de Ventas
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.68rem',
                          fontWeight: '700',
                          color: '#15803D',
                          backgroundColor: '#F0FDF4',
                          border: '1px solid #DCFCE7',
                          padding: '1px 7px',
                          borderRadius: '12px'
                        }}
                      >
                        <span className="chart-pulse-badge" /> EN VIVO
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: '#171717', letterSpacing: '-0.02em' }}>
                      {chartViewMode === 'revenue_accum' && 'Ingresos acumulados del período'}
                      {chartViewMode === 'revenue' && 'Facturación diaria confirmada'}
                      {chartViewMode === 'orders' && 'Volumen de pedidos por checkpoint'}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#737373' }}>
                      {chartViewMode.startsWith('revenue') 
                        ? `Total acumulado: ${formatMoney(totalNetRevenue)} en ${orders.length} pedidos (${totalUnitsSold} prendas)`
                        : `Total de transacciones: ${orders.length} pedidos procesados`}
                    </p>
                  </div>

                  {/* Selector de métricas y tipo de gráfica */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Botones de Métrica */}
                    <div style={{ display: 'flex', backgroundColor: '#F6F6F6', padding: '3px', borderRadius: '6px', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => setChartViewMode('revenue_accum')}
                        style={{
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '5px',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          backgroundColor: chartViewMode === 'revenue_accum' ? '#0A0A0A' : 'transparent',
                          color: chartViewMode === 'revenue_accum' ? '#FFFFFF' : '#737373',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Acumulado
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartViewMode('revenue')}
                        style={{
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '5px',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          backgroundColor: chartViewMode === 'revenue' ? '#0A0A0A' : 'transparent',
                          color: chartViewMode === 'revenue' ? '#FFFFFF' : '#737373',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Por Día
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartViewMode('orders')}
                        style={{
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '5px',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          backgroundColor: chartViewMode === 'orders' ? '#0A0A0A' : 'transparent',
                          color: chartViewMode === 'orders' ? '#FFFFFF' : '#737373',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Pedidos
                      </button>
                    </div>

                    {/* Toggle Curva vs Barras */}
                    <div style={{ display: 'flex', backgroundColor: '#F6F6F6', padding: '3px', borderRadius: '6px', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => setChartType('area')}
                        title="Ver curva fluida"
                        style={{
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: chartType === 'area' ? '#0A0A0A' : 'transparent',
                          color: chartType === 'area' ? '#FFFFFF' : '#737373',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Activity size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartType('bar')}
                        title="Ver columnas ejecutivas"
                        style={{
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: chartType === 'bar' ? '#0A0A0A' : 'transparent',
                          color: chartType === 'bar' ? '#FFFFFF' : '#737373',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <BarChart3 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

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
                            <stop offset="5%" stopColor="#0A0A0A" stopOpacity={0.16} />
                            <stop offset="60%" stopColor="#0A0A0A" stopOpacity={0.03} />
                            <stop offset="98%" stopColor="#0A0A0A" stopOpacity={0.00} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                        <XAxis
                          dataKey="label"
                          axisLine={{ stroke: '#E7E7E7' }}
                          tickLine={false}
                          tick={{ fill: '#737373', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                          dy={8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#A3A3A3', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                          tickFormatter={(val) => {
                            if (chartViewMode === 'orders') return `${val}`;
                            if (val === 0) return '$0';
                            if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                            return `$${Math.round(val / 1000)}k`;
                          }}
                          dx={-5}
                        />
                        <Tooltip
                          content={<CustomChartTooltip formatMoney={formatMoney} chartViewMode={chartViewMode} />}
                          cursor={{ stroke: '#0A0A0A', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                        />
                        <Area
                          type="monotone"
                          dataKey={chartViewMode === 'orders' ? 'orders' : (chartViewMode === 'revenue' ? 'revenue' : 'revenue_accum')}
                          stroke="#0A0A0A"
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                        <XAxis
                          dataKey="label"
                          axisLine={{ stroke: '#E7E7E7' }}
                          tickLine={false}
                          tick={{ fill: '#737373', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                          dy={8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#A3A3A3', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                          tickFormatter={(val) => {
                            if (chartViewMode === 'orders') return `${val}`;
                            if (val === 0) return '$0';
                            if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                            return `$${Math.round(val / 1000)}k`;
                          }}
                          dx={-5}
                        />
                        <Tooltip
                          content={<CustomChartTooltip formatMoney={formatMoney} chartViewMode={chartViewMode} />}
                          cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                        />
                        <Bar
                          dataKey={chartViewMode === 'orders' ? 'orders' : (chartViewMode === 'revenue' ? 'revenue' : 'revenue_accum')}
                          fill="#0A0A0A"
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
                    borderTop: '1px solid #F6F6F6',
                    fontSize: '0.74rem',
                    color: '#737373'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', backgroundColor: '#0A0A0A', borderRadius: '50%' }} />
                      <span>{chartViewMode.startsWith('revenue') ? 'Facturación Neta COP' : 'Pedidos Confirmados'}</span>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span className="chart-pulse-badge" />
                      <span>Ticket Promedio: <strong>{formatMoney(averageOrderValue)}</strong></span>
                    </span>
                  </div>

                  <span style={{ color: '#A3A3A3', fontSize: '0.72rem' }}>
                    Pasa el cursor sobre la gráfica para ver detalles por fecha
                  </span>
                </div>
              </div>

              {/* Distribución de Pedidos & Top Prendas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                {/* Columna 1: Distribución por Estados */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>
                      Estado Operativo de Pedidos
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: '#737373' }}>
                      Total {orders.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'Entregados', count: deliveredOrders.length, color: '#15803D', bg: '#F0FDF4' },
                      { label: 'En proceso / Pendientes', count: pendingOrders.length, color: '#B45309', bg: '#FFFBEB' },
                      { label: 'Cancelados', count: cancelledOrders.length, color: '#B91C1C', bg: '#FEF2F2' }
                    ].map(st => {
                      const pct = orders.length > 0 ? Math.round((st.count / orders.length) * 100) : 0;
                      return (
                        <div key={st.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                            <span style={{ color: '#171717', fontWeight: '600' }}>{st.label}</span>
                            <span style={{ color: '#737373' }}>{st.count} ({pct}%)</span>
                          </div>
                          <div style={{ height: '6px', width: '100%', backgroundColor: '#F6F6F6', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: st.color, borderRadius: '3px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Columna 2: Top 5 Prendas Más Vendidas */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>
                      Prendas Más Vendidas
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: '#737373' }}>Por volumen</span>
                  </div>

                  {topProducts.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: '#737373', margin: 0 }}>Aún no hay ventas registradas.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {topProducts.map((item, idx) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            borderBottom: idx < topProducts.length - 1 ? '1px solid #F6F6F6' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#737373', width: '16px' }}>
                              0{idx + 1}
                            </span>
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#F6F6F6' }}
                            />
                            <div>
                              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#171717', display: 'block' }}>
                                {item.name}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#737373' }}>
                                {item.quantity} unidades vendidas
                              </span>
                            </div>
                          </div>
                          <strong style={{ fontSize: '0.84rem', color: '#171717' }}>
                            {formatMoney(item.revenue)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tabla Resumen de Órdenes Recientes */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>
                      Últimos Pedidos Recibidos
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: '#737373' }}>Transacciones más recientes en tienda</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0A0A0A',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Ver todos los pedidos</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E7E7E7', color: '#737373', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '10px 14px' }}>ID Pedido</th>
                        <th style={{ padding: '10px 14px' }}>Fecha</th>
                        <th style={{ padding: '10px 14px' }}>Cliente</th>
                        <th style={{ padding: '10px 14px' }}>Prendas</th>
                        <th style={{ padding: '10px 14px' }}>Total (COP)</th>
                        <th style={{ padding: '10px 14px' }}>Estado</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 4).map(ord => (
                        <tr key={ord.orderId} className="admin-table-row" style={{ borderBottom: '1px solid #F6F6F6' }}>
                          <td style={{ padding: '12px 14px', fontWeight: '700', color: '#171717' }}>{ord.orderId}</td>
                          <td style={{ padding: '12px 14px', color: '#737373' }}>{ord.date}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: '600', color: '#171717' }}>{ord.customer?.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#737373' }}>{ord.customer?.city || 'Medellín'}</div>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#737373' }}>{ord.count || (ord.items || []).length} ud(s)</td>
                          <td style={{ padding: '12px 14px', fontWeight: '700', color: '#171717' }}>{formatMoney(ord.total)}</td>
                          <td style={{ padding: '12px 14px' }}>{renderOrderStatusBadge(ord.orderStatus)}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderDetails(ord);
                                setActiveTab('orders');
                              }}
                              className="admin-btn-secondary"
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#F6F6F6',
                                border: '1px solid #E7E7E7',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: '600',
                                color: '#171717',
                                cursor: 'pointer'
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Barra de Filtros y Búsqueda */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E7E7E7',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                {/* Buscador */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
                  <Search size={16} color="#737373" />
                  <input
                    type="text"
                    placeholder="Buscar prenda por nombre, categoría o ID..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={{
                      width: '100%',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#171717',
                      fontSize: '0.86rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Filtros de Categoría */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#737373', fontWeight: '600', marginRight: '4px' }}>Categoría:</span>
                  {['Todas', 'Camisetas', 'Sudaderas', 'Chaquetas', 'Pantalones'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setProductCategoryFilter(cat)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: productCategoryFilter === cat ? '#0A0A0A' : '#F6F6F6',
                        color: productCategoryFilter === cat ? '#FFFFFF' : '#737373',
                        fontSize: '0.74rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Selector de Vista (Tabla vs Cards) */}
                <div style={{ display: 'flex', border: '1px solid #E7E7E7', borderRadius: '4px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setProductViewMode('table')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: productViewMode === 'table' ? '#0A0A0A' : '#FFFFFF',
                      color: productViewMode === 'table' ? '#FFFFFF' : '#737373',
                      border: 'none',
                      fontSize: '0.74rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Tabla
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductViewMode('cards')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: productViewMode === 'cards' ? '#0A0A0A' : '#FFFFFF',
                      color: productViewMode === 'cards' ? '#FFFFFF' : '#737373',
                      border: 'none',
                      fontSize: '0.74rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Tarjetas
                  </button>
                </div>
              </div>

              {/* Listado de Productos en Modo Tabla */}
              {productViewMode === 'table' ? (
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E7E7E7', backgroundColor: '#FAFAFA', color: '#737373', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '12px 18px' }}>Prenda</th>
                        <th style={{ padding: '12px 18px' }}>Categoría</th>
                        <th style={{ padding: '12px 18px' }}>Precio (COP)</th>
                        <th style={{ padding: '12px 18px' }}>Existencias</th>
                        <th style={{ padding: '12px 18px' }}>Estado</th>
                        <th style={{ padding: '12px 18px', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #F6F6F6' }}>
                          <td style={{ padding: '12px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img
                                src={p.image}
                                alt={p.name}
                                style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#F6F6F6' }}
                              />
                              <div>
                                <span style={{ fontWeight: '700', color: '#171717', display: 'block' }}>{p.name}</span>
                                <span style={{ fontSize: '0.72rem', color: '#737373' }}>SKU-{p.id}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 18px', color: '#737373' }}>{p.category}</td>
                          <td style={{ padding: '12px 18px', fontWeight: '700', color: '#171717' }}>{formatMoney(p.price)}</td>
                          <td style={{ padding: '12px 18px', fontWeight: '600' }}>{p.stock} uds</td>
                          <td style={{ padding: '12px 18px' }}>{renderStockBadge(p.stock)}</td>
                          <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(p)}
                                title="Editar prenda"
                                style={{
                                  padding: '6px',
                                  backgroundColor: '#F6F6F6',
                                  border: '1px solid #E7E7E7',
                                  borderRadius: '4px',
                                  color: '#171717',
                                  cursor: 'pointer'
                                }}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmProduct(p)}
                                title="Eliminar del catálogo"
                                style={{
                                  padding: '6px',
                                  backgroundColor: '#FEF2F2',
                                  border: '1px solid #FECACA',
                                  borderRadius: '4px',
                                  color: '#DC2626',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Modo Tarjetas */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                  {filteredProducts.map(p => (
                    <div
                      key={p.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E7E7E7',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ height: '220px', backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }}
                        />
                        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                          {renderStockBadge(p.stock)}
                        </div>
                      </div>

                      <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: '#171717' }}>{p.name}</h4>
                            <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#171717' }}>{formatMoney(p.price)}</span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#737373', display: 'block', marginBottom: '14px' }}>{p.category} · SKU-{p.id}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #F0F0F0', paddingTop: '12px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(p)}
                            style={{
                              flex: 1,
                              padding: '7px',
                              backgroundColor: '#F6F6F6',
                              border: '1px solid #E7E7E7',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: '#171717',
                              cursor: 'pointer'
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmProduct(p)}
                            style={{
                              padding: '7px 10px',
                              backgroundColor: '#FEF2F2',
                              border: '1px solid #FECACA',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              color: '#DC2626',
                              cursor: 'pointer'
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==============================================================
              VISTA 3: INVENTARIO (EXISTENCIAS EN TIEMPO REAL & REABASTECIMIENTO)
              ============================================================== */}
          {activeTab === 'inventory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Tarjetas Superiores de Bodega */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '18px 20px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#737373', display: 'block', marginBottom: '6px' }}>
                    Total Unidades en Bodega
                  </span>
                  <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#171717' }}>
                    {totalStockUnits}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#737373' }}>En {products.length} referencias</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '18px 20px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#737373', display: 'block', marginBottom: '6px' }}>
                    Referencias Críticas (≤ 5)
                  </span>
                  <div style={{ fontSize: '1.65rem', fontWeight: '800', color: lowStockProducts.length > 0 ? '#B45309' : '#171717' }}>
                    {lowStockProducts.length}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#737373' }}>Requieren reabastecimiento pronto</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '18px 20px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#737373', display: 'block', marginBottom: '6px' }}>
                    Referencias Agotadas (0)
                  </span>
                  <div style={{ fontSize: '1.65rem', fontWeight: '800', color: outOfStockProducts.length > 0 ? '#DC2626' : '#15803D' }}>
                    {outOfStockProducts.length}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#737373' }}>Sin existencias para venta</span>
                </div>
              </div>

              {/* Herramienta de Reabastecimiento Rápido */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800' }}>
                      Reabastecimiento de Existencias por Prenda
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: '#737373' }}>
                      Incrementa las existencias físicas cuando llegue un despacho de confección
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={exportInventoryToCSV}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: '#F6F6F6',
                      border: '1px solid #E7E7E7',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#171717',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={14} />
                    <span>Exportar Inventario CSV</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {products.map(p => {
                    const inputVal = customRestockInputs[p.id] || '';
                    return (
                      <div
                        key={p.id}
                        style={{
                          backgroundColor: '#FAFAFA',
                          border: '1px solid #E7E7E7',
                          borderRadius: '6px',
                          padding: '16px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7' }}
                          />
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: '0.84rem', color: '#171717', display: 'block' }}>{p.name}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#737373' }}>Stock actual: <strong>{p.stock} uds</strong></span>
                          </div>
                          {renderStockBadge(p.stock)}
                        </div>

                        {/* Botones rápidos */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                          {[5, 10, 25].map(qty => (
                            <button
                              key={qty}
                              type="button"
                              onClick={() => handleQuickRestock(p.id, qty)}
                              style={{
                                flex: 1,
                                padding: '5px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E7E7E7',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: '600',
                                color: '#171717',
                                cursor: 'pointer'
                              }}
                            >
                              +{qty} uds
                            </button>
                          ))}
                        </div>

                        {/* Cantidad personalizada */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            type="number"
                            min="1"
                            placeholder="Cant."
                            value={inputVal}
                            onChange={(e) => setCustomRestockInputs({ ...customRestockInputs, [p.id]: e.target.value })}
                            style={{
                              width: '70px',
                              padding: '5px 8px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E7E7E7',
                              borderRadius: '4px',
                              fontSize: '0.78rem',
                              outline: 'none',
                              textAlign: 'center'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickRestock(p.id, inputVal)}
                            style={{
                              flex: 1,
                              padding: '6px 12px',
                              backgroundColor: '#0A0A0A',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Sumar a existencias
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              VISTA 4: PEDIDOS (GESTIÓN INTEGRAL DE ÓRDENES)
              ============================================================== */}
          {activeTab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Barra de Filtros y Búsqueda */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E7E7E7',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                {/* Búsqueda */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
                  <Search size={16} color="#737373" />
                  <input
                    type="text"
                    placeholder="Buscar por ID, cliente, correo o ciudad..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{
                      width: '100%',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#171717',
                      fontSize: '0.86rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Filtros por Estado */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {['Todos', 'En proceso', 'Enviado', 'Entregado', 'Cancelado'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setOrderStatusFilter(st);
                        setOrdersPage(1);
                      }}
                      style={{
                        padding: '5px 11px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: orderStatusFilter === st ? '#0A0A0A' : '#F6F6F6',
                        color: orderStatusFilter === st ? '#FFFFFF' : '#737373',
                        fontSize: '0.74rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Exportar CSV */}
                <button
                  type="button"
                  onClick={exportOrdersToCSV}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#F6F6F6',
                    border: '1px solid #E7E7E7',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#171717',
                    cursor: 'pointer'
                  }}
                >
                  <Download size={14} />
                  <span>Descargar CSV</span>
                </button>
              </div>

              {/* Tabla de Pedidos */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', overflow: 'hidden' }}>
                {paginatedOrders.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <ClipboardList size={32} color="#A3A3A3" style={{ margin: '0 auto 10px' }} />
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#171717' }}>No se encontraron órdenes</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#737373' }}>Intenta ajustar el término de búsqueda o el filtro de estado.</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E7E7E7', backgroundColor: '#FAFAFA', color: '#737373', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '12px 16px' }}>ID Pedido</th>
                        <th style={{ padding: '12px 16px' }}>Fecha</th>
                        <th style={{ padding: '12px 16px' }}>Cliente</th>
                        <th style={{ padding: '12px 16px' }}>Pago</th>
                        <th style={{ padding: '12px 16px' }}>Total COP</th>
                        <th style={{ padding: '12px 16px' }}>Estado Operativo</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map(ord => (
                        <tr key={ord.orderId} style={{ borderBottom: '1px solid #F6F6F6' }}>
                          <td style={{ padding: '14px 16px', fontWeight: '700', color: '#171717' }}>
                            {ord.orderId}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#737373' }}>
                            {ord.date}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: '600', color: '#171717' }}>{ord.customer?.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#737373' }}>{ord.customer?.email}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontSize: '0.76rem', color: '#171717', fontWeight: '500', display: 'block' }}>
                              {ord.payment?.method === 'card' ? 'Tarjeta' : (ord.payment?.method === 'transfer' ? 'Transferencia' : 'Efectivo')}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#737373' }}>
                              {ord.payment?.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: '800', color: '#171717' }}>
                            {formatMoney(ord.total)}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {/* Selector directo de estado autorizado */}
                            <select
                              value={ord.orderStatus || 'En proceso'}
                              onChange={(e) => updateOrderStatus(ord.orderId, e.target.value)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.74rem',
                                fontWeight: '600',
                                backgroundColor: '#F6F6F6',
                                border: '1px solid #E7E7E7',
                                color: '#171717',
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            >
                              <option value="En proceso">En proceso</option>
                              <option value="Enviado">Enviado</option>
                              <option value="Entregado">Entregado</option>
                              <option value="Cancelado">Cancelado</option>
                            </select>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderDetails(ord)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 10px',
                                backgroundColor: '#F6F6F6',
                                border: '1px solid #E7E7E7',
                                borderRadius: '4px',
                                fontSize: '0.74rem',
                                fontWeight: '600',
                                color: '#171717',
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={13} />
                              <span>Ver</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Paginación */}
                {totalOrderPages > 1 && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderTop: '1px solid #E7E7E7',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.78rem',
                      color: '#737373'
                    }}
                  >
                    <span>
                      Página {ordersPage} de {totalOrderPages} ({filteredOrders.length} pedidos en total)
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        disabled={ordersPage === 1}
                        onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#F6F6F6',
                          border: '1px solid #E7E7E7',
                          borderRadius: '4px',
                          cursor: ordersPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        disabled={ordersPage === totalOrderPages}
                        onClick={() => setOrdersPage(p => Math.min(totalOrderPages, p + 1))}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#F6F6F6',
                          border: '1px solid #E7E7E7',
                          borderRadius: '4px',
                          cursor: ordersPage === totalOrderPages ? 'not-allowed' : 'pointer'
                        }}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E7E7E7',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
                  <Search size={16} color="#737373" />
                  <input
                    type="text"
                    placeholder="Buscar cliente por nombre, email o ciudad..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    style={{
                      width: '100%',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#171717',
                      fontSize: '0.86rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <span style={{ fontSize: '0.78rem', color: '#737373' }}>
                  {filteredCustomers.length} clientes encontrados
                </span>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E7E7E7', backgroundColor: '#FAFAFA', color: '#737373', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '12px 16px' }}>Cliente</th>
                      <th style={{ padding: '12px 16px' }}>Contacto</th>
                      <th style={{ padding: '12px 16px' }}>Ciudad / Ubicación</th>
                      <th style={{ padding: '12px 16px' }}>Pedidos</th>
                      <th style={{ padding: '12px 16px' }}>Facturación Acumulada</th>
                      <th style={{ padding: '12px 16px' }}>Última Compra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F6F6F6' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#F0F0F0',
                                color: '#171717',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                              }}
                            >
                              {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <strong style={{ color: '#171717' }}>{c.name}</strong>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#737373' }}>
                          <div>{c.email}</div>
                          {c.phone && <div style={{ fontSize: '0.7rem' }}>{c.phone}</div>}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#171717' }}>{c.city || 'Medellín'}</td>
                        <td style={{ padding: '14px 16px', fontWeight: '600' }}>{c.orderCount} pedido(s)</td>
                        <td style={{ padding: '14px 16px', fontWeight: '800', color: '#171717' }}>{formatMoney(c.totalSpent)}</td>
                        <td style={{ padding: '14px 16px', color: '#737373' }}>{c.lastOrderDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==============================================================
              VISTA 6: VENTAS (DESGLOSE FINANCIERO & RECAUDO)
              ============================================================== */}
          {activeTab === 'sales' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '20px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#737373', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                    Ventas Brutas Totales
                  </span>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#171717' }}>{formatMoney(totalGrossRevenue)}</div>
                  <span style={{ fontSize: '0.72rem', color: '#737373' }}>Incluye todas las órdenes registradas</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '20px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#737373', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                    Ventas Netas Confirmadas
                  </span>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#15803D' }}>{formatMoney(totalNetRevenue)}</div>
                  <span style={{ fontSize: '0.72rem', color: '#737373' }}>Órdenes vigentes en preparación y entregadas</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '20px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#737373', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                    Volumen Cancelado
                  </span>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#DC2626' }}>{formatMoney(cancelledRevenue)}</div>
                  <span style={{ fontSize: '0.72rem', color: '#737373' }}>{cancelledOrders.length} pedido(s) dados de baja</span>
                </div>
              </div>

              {/* Métodos de Pago */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '0.98rem', fontWeight: '800' }}>Distribución por Medio de Pago</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {[
                    { method: 'Tarjeta de Crédito / Débito', key: 'card' },
                    { method: 'Transferencia Bancolombia / Nequi', key: 'transfer' },
                    { method: 'Pago Contra Entrega en Efectivo', key: 'cash' }
                  ].map(m => {
                    const matchOrders = validOrders.filter(o => (o.payment?.method || 'card') === m.key);
                    const sum = matchOrders.reduce((acc, o) => acc + (o.total || 0), 0);
                    const pct = totalNetRevenue > 0 ? Math.round((sum / totalNetRevenue) * 100) : 0;
                    return (
                      <div key={m.key} style={{ padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '6px', border: '1px solid #E7E7E7' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#171717', display: 'block', marginBottom: '4px' }}>
                          {m.method}
                        </span>
                        <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#171717', marginBottom: '4px' }}>
                          {formatMoney(sum)}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#737373' }}>
                          {matchOrders.length} transacción(es) · {pct}% del total
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              VISTA 7: REPORTES (MÉTRICAS & EXPORTACIÓN)
              ============================================================== */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '24px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: '800' }}>Centro de Informes y Exportación</h4>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.82rem', color: '#737373' }}>
                  Descarga en formato CSV plano los registros operativos de ventas e inventario para auditoría contable.
                </p>

                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={exportOrdersToCSV}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      backgroundColor: '#0A0A0A',
                      color: '#FFFFFF',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={16} />
                    <span>Exportar Libro de Pedidos (CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={exportInventoryToCSV}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      backgroundColor: '#FFFFFF',
                      color: '#171717',
                      borderRadius: '6px',
                      border: '1px solid #E7E7E7',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={16} />
                    <span>Exportar Existencias en Bodega (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Tabla de Rendimiento por Categoría */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '0.98rem', fontWeight: '800' }}>Rendimiento Comercial por Categoría</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E7E7E7', color: '#737373', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 14px' }}>Categoría</th>
                      <th style={{ padding: '10px 14px' }}>Prendas Activas</th>
                      <th style={{ padding: '10px 14px' }}>Existencias Físicas</th>
                      <th style={{ padding: '10px 14px' }}>Ingresos Generados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Camisetas', 'Sudaderas', 'Chaquetas', 'Pantalones'].map(cat => {
                      const prods = products.filter(p => p.category === cat);
                      const stockSum = prods.reduce((acc, p) => acc + (p.stock || 0), 0);
                      const revenue = categorySales[cat] || 0;
                      return (
                        <tr key={cat} style={{ borderBottom: '1px solid #F6F6F6' }}>
                          <td style={{ padding: '12px 14px', fontWeight: '700' }}>{cat}</td>
                          <td style={{ padding: '12px 14px', color: '#737373' }}>{prods.length} modelo(s)</td>
                          <td style={{ padding: '12px 14px' }}>{stockSum} uds</td>
                          <td style={{ padding: '12px 14px', fontWeight: '700', color: '#171717' }}>{formatMoney(revenue)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==============================================================
              VISTA 8: CONFIGURACIÓN (AJUSTES DE LA MARCA)
              ============================================================== */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '28px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: '800' }}>Información Corporativa de Sauz Store</h4>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.8rem', color: '#737373' }}>
                  Parámetros del sistema de facturación y despacho para Colombia.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}>
                      Nombre de la Marca
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="Sauz Store Colombia"
                      style={{ width: '100%', padding: '9px 12px', backgroundColor: '#FAFAFA', border: '1px solid #E7E7E7', borderRadius: '6px', fontSize: '0.86rem', color: '#171717', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}>
                        Moneda Operativa
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="COP ($ Peso Colombiano)"
                        style={{ width: '100%', padding: '9px 12px', backgroundColor: '#FAFAFA', border: '1px solid #E7E7E7', borderRadius: '6px', fontSize: '0.86rem', color: '#171717', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}>
                        Tasa de IVA Aplicable
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="16% (Incluido en Total)"
                        style={{ width: '100%', padding: '9px 12px', backgroundColor: '#FAFAFA', border: '1px solid #E7E7E7', borderRadius: '6px', fontSize: '0.86rem', color: '#171717', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}>
                      Bodega y Centro Logístico
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="Calle 10 # 40-20, El Poblado, Medellín, Colombia"
                      style={{ width: '100%', padding: '9px 12px', backgroundColor: '#FAFAFA', border: '1px solid #E7E7E7', borderRadius: '6px', fontSize: '0.86rem', color: '#171717', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}>
                      Tiempo Promedio de Entrega
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="2 a 4 días hábiles nacionales"
                      style={{ width: '100%', padding: '9px 12px', backgroundColor: '#FAFAFA', border: '1px solid #E7E7E7', borderRadius: '6px', fontSize: '0.86rem', color: '#171717', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => showToast('Parámetros corporativos validados correctamente')}
                      style={{
                        padding: '9px 18px',
                        backgroundColor: '#0A0A0A',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Guardar Preferencias
                    </button>
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
      {isCreateProductModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10010,
            backgroundColor: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E7E7E7',
              borderRadius: '8px',
              padding: '28px',
              boxShadow: '0 20px 45px rgba(0,0,0,0.12)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#171717' }}>
                {editingProduct ? 'Editar Prenda' : 'Nueva Prenda de Colección'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateProductModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}>
                  Nombre de la prenda *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Hoodie Hellstar Edición Limitada"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px solid #E7E7E7',
                    borderRadius: '6px',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}>
                    Categoría *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1px solid #E7E7E7',
                      borderRadius: '6px',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="Camisetas">Camisetas</option>
                    <option value="Sudaderas">Sudaderas</option>
                    <option value="Chaquetas">Chaquetas</option>
                    <option value="Pantalones">Pantalones</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}>
                    Precio (COP) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    placeholder="85000"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1px solid #E7E7E7',
                      borderRadius: '6px',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}>
                    Stock Inicial *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1px solid #E7E7E7',
                      borderRadius: '6px',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}>
                    Imagen *
                  </label>
                  <select
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1px solid #E7E7E7',
                      borderRadius: '6px',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="/Productos/jordan_Blanca.png">Camisa Jordan Blanca</option>
                    <option value="/Productos/Jordan_negra.png">Camisa Jordan Negra</option>
                    <option value="/Productos/hellstart_negra.png">Camisa Hellstar</option>
                    <option value="/Productos/moon.png">Camisa Moon</option>
                    <option value="/Productos/Ungd.png">Camisa Undg</option>
                    <option value="/Productos/letras_negra.png">Camisa Letras</option>
                    <option value="/Productos/Monastery_lado1.png">Hoodie Monastery</option>
                    <option value="/Productos/hoodie_negro.png">Hoodie Estrella</option>
                    <option value="/Productos/hoddie_blanco3.png">Hoodie Blanco Estrella</option>
                    <option value="/Productos/hoodie_negro2.png">Hoodie Negro Estampado</option>
                    <option value="/Productos/hodie_Blanco2.png">Hoodie Angel</option>
                    <option value="/Productos/Hugo_sueter.png">Hoodie Hugo</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}>
                  Descripción Editorial de la Prenda
                </label>
                <textarea
                  rows="3"
                  placeholder="Confeccionada con algodón de 260 GSM, corte holgado y detalles de marca..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px solid #E7E7E7',
                    borderRadius: '6px',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateProductModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    backgroundColor: '#F6F6F6',
                    border: '1px solid #E7E7E7',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#171717',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    backgroundColor: '#0A0A0A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Prenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: DETALLES COMPLETOS DE PEDIDO
          ============================================================== */}
      {selectedOrderDetails && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10010,
            backgroundColor: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E7E7E7',
              borderRadius: '8px',
              padding: '28px',
              boxShadow: '0 20px 45px rgba(0,0,0,0.12)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #E7E7E7', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#171717' }}>
                    {selectedOrderDetails.orderId}
                  </h3>
                  {renderOrderStatusBadge(selectedOrderDetails.orderStatus)}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#737373', display: 'block', marginTop: '4px' }}>
                  Fecha de compra: {selectedOrderDetails.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Datos del Cliente y Despacho */}
            <div style={{ backgroundColor: '#FAFAFA', border: '1px solid #E7E7E7', borderRadius: '6px', padding: '16px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#737373', display: 'block', marginBottom: '8px' }}>
                Información de Entrega
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: '#737373', display: 'block', fontSize: '0.7rem' }}>Comprador:</span>
                  <strong>{selectedOrderDetails.customer?.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#737373', display: 'block', fontSize: '0.7rem' }}>Email:</span>
                  <span>{selectedOrderDetails.customer?.email}</span>
                </div>
                <div>
                  <span style={{ color: '#737373', display: 'block', fontSize: '0.7rem' }}>Teléfono:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{selectedOrderDetails.customer?.phone || 'No registrado'}</span>
                    {selectedOrderDetails.customer?.phone && (
                      <a
                        href={`https://wa.me/${selectedOrderDetails.customer.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(selectedOrderDetails.customer.name)}%2C%20te%20escribimos%20de%20Sauz%20Store%20sobre%20tu%20pedido%20${selectedOrderDetails.orderId}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#15803D', fontWeight: '600', textDecoration: 'none', fontSize: '0.75rem' }}
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#737373', display: 'block', fontSize: '0.7rem' }}>Dirección y Ciudad:</span>
                  <span>{selectedOrderDetails.customer?.address}, {selectedOrderDetails.customer?.city || 'Medellín'}</span>
                </div>
              </div>
            </div>

            {/* Prendas Llevadas */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#737373', display: 'block', marginBottom: '10px' }}>
                Prendas en esta Orden ({(selectedOrderDetails.items || []).length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedOrderDetails.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E7E7E7',
                      borderRadius: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#F6F6F6' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.82rem', color: '#171717', display: 'block' }}>{item.name}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#737373' }}>
                          {item.quantity} ud(s) × {formatMoney(item.price)}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '0.84rem', color: '#171717' }}>
                      {formatMoney(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen Financiero de la Orden */}
            <div style={{ borderTop: '1px solid #E7E7E7', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#737373' }}>
                <span>Subtotal:</span>
                <span>{formatMoney(selectedOrderDetails.subtotal || (selectedOrderDetails.total * 0.84))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#737373' }}>
                <span>IVA (16%):</span>
                <span>{formatMoney(selectedOrderDetails.tax || (selectedOrderDetails.total * 0.16))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '800', color: '#171717', borderTop: '1px solid #F0F0F0', paddingTop: '8px' }}>
                <span>Total Facturado:</span>
                <span>{formatMoney(selectedOrderDetails.total)}</span>
              </div>
            </div>

            {/* Selector de Estado Operativo dentro del Modal */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E7E7E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: '#737373' }}>Actualizar estado operativo:</span>
              <select
                value={selectedOrderDetails.orderStatus || 'En proceso'}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  await updateOrderStatus(selectedOrderDetails.orderId, newStatus);
                  setSelectedOrderDetails({ ...selectedOrderDetails, orderStatus: newStatus });
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid #E7E7E7',
                  backgroundColor: '#F6F6F6',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  color: '#171717',
                  cursor: 'pointer'
                }}
              >
                <option value="En proceso">En proceso</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
          ============================================================== */}
      {deleteConfirmProduct && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10020,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 20px 45px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626', marginBottom: '12px' }}>
              <AlertCircle size={22} />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Confirmar eliminación</h4>
            </div>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.84rem', color: '#737373', lineHeight: 1.5 }}>
              ¿Estás seguro de que deseas eliminar la prenda <strong>"{deleteConfirmProduct.name}"</strong>? Esta acción removerá el slot de bodega y de la tienda pública.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#F6F6F6',
                  border: '1px solid #E7E7E7',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteProduct}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
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
            box-shadow: 0 0 50px rgba(0,0,0,0.2) !important;
          }
          .admin-mobile-toggle-btn {
            display: flex !important;
          }
          .admin-period-controls {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
