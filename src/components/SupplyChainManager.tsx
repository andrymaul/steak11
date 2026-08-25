import React, { useState } from 'react';
import {
  Truck,
  Boxes,
  ShoppingCart,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Star,
  Send,
  Building2,
  Search,
  ChefHat,
  ClipboardList,
  ArrowRightLeft,
  Calendar,
  Layers,
  UtensilsCrossed,
  Info,
  Clock,
  Check,
  X,
  History,
  FileSpreadsheet,
  Printer,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import {
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  InventoryItem,
  MenuRecipe,
  RecipeItem,
  StockOpnameLog,
  StockTransfer,
  MenuItem,
  StockMutation
} from '../types';
import {
  formatRupiah,
  getStoredRecipes,
  saveRecipes,
  getStoredStockOpnames,
  saveStockOpnames,
  getStoredStockTransfers,
  saveStockTransfers,
  getStoredMenuItems,
  saveMenuItems,
  getStoredStockMutations,
  saveStockMutations,
  isRegisteredAdmin,
  recordAuditLog
} from '../utils';

interface SupplyChainManagerProps {
  suppliers: Supplier[];
  setSuppliers?: React.Dispatch<React.SetStateAction<Supplier[]>>;
  saveSuppliersData: (data: Supplier[]) => void;
  purchaseOrders: PurchaseOrder[];
  setPurchaseOrders?: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  savePurchaseOrdersData: (data: PurchaseOrder[]) => void;
  inventory: InventoryItem[];
  setInventory?: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  saveInventoryData: (data: InventoryItem[]) => void;
  showToast: (msg: string) => void;
  outletsList?: string[];
  initialSubTab?: 'inventory' | 'recipes' | 'stock_opname' | 'stock_transfers' | 'stock_card' | 'suppliers' | 'purchase_orders';
  currentUser?: { name: string; role: string } | null;
}

export const SupplyChainManager: React.FC<SupplyChainManagerProps> = ({
  suppliers = [],
  setSuppliers = (_: any) => {},
  saveSuppliersData = (_: any) => {},
  purchaseOrders = [],
  setPurchaseOrders = (_: any) => {},
  savePurchaseOrdersData = (_: any) => {},
  inventory = [],
  setInventory = (_: any) => {},
  saveInventoryData = (_: any) => {},
  showToast = (_: any) => {},
  outletsList = [],
  initialSubTab = 'inventory',
  currentUser
}) => {
  const isReadOnlyVisitor = !isRegisteredAdmin(currentUser);
  const checkReadOnlyPermission = (): boolean => {
    if (isReadOnlyVisitor) {
      showToast('🔒 Akses Ditolak: Hanya Admin Terdaftar yang memiliki izin untuk Edit & Hapus data.');
      return true;
    }
    return false;
  };

  // Main Sub-Tab Navigation
  const [subTab, setSubTab] = useState<
    'inventory' | 'recipes' | 'stock_opname' | 'stock_transfers' | 'stock_card' | 'suppliers' | 'purchase_orders'
  >(initialSubTab || 'inventory');

  React.useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Recipes, Opnames, Transfers, and Mutations local states
  const [recipes, setRecipes] = useState<MenuRecipe[]>(() => getStoredRecipes());
  const [stockOpnames, setStockOpnames] = useState<StockOpnameLog[]>(() => getStoredStockOpnames());
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(() => getStoredStockTransfers());
  const [stockMutations, setStockMutations] = useState<StockMutation[]>(() => getStoredStockMutations());
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getStoredMenuItems());

  // Stock Card (Kartu Stok) Filter & Manual Mutation States
  const [cardItemFilter, setCardItemFilter] = useState('ALL');
  const [cardOutletFilter, setCardOutletFilter] = useState('ALL');
  const [cardMutationTypeFilter, setCardMutationTypeFilter] = useState('ALL');
  const [cardSearch, setCardSearch] = useState('');

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'inventory' | 'supplier' | 'purchase_order';
    id: string;
    title: string;
    description: string;
  } | null>(null);

  const executeDeleteConfirm = () => {
    if (!deleteConfirmTarget) return;
    if (checkReadOnlyPermission()) {
      setDeleteConfirmTarget(null);
      return;
    }
    const { type, id } = deleteConfirmTarget;
    if (type === 'inventory') {
      const item = inventory.find((i) => i.id === id);
      const updated = inventory.filter((item) => item.id !== id);
      setInventory(updated);
      saveInventoryData(updated);
      showToast(`🗑️ Bahan baku "${item?.name || id}" telah dihapus.`);
    } else if (type === 'supplier') {
      const sup = suppliers.find((s) => s.id === id);
      const updated = suppliers.filter((s) => s.id !== id);
      setSuppliers(updated);
      saveSuppliersData(updated);
      showToast(`🗑️ Supplier "${sup?.name || id}" telah dihapus.`);
    } else if (type === 'purchase_order') {
      const po = purchaseOrders.find((p) => p.id === id);
      const updated = purchaseOrders.filter((p) => p.id !== id);
      setPurchaseOrders(updated);
      savePurchaseOrdersData(updated);
      showToast(`🗑️ PO "${po?.poNumber || id}" telah dihapus.`);
    }
    setDeleteConfirmTarget(null);
  };

  const [showMutationModal, setShowMutationModal] = useState(false);
  const [mutInvId, setMutInvId] = useState('');
  const [mutType, setMutType] = useState<string>('Masuk (Penyesuaian)');
  const [mutQty, setMutQty] = useState<number>(1);
  const [mutNotes, setMutNotes] = useState('');
  const [mutUser, setMutUser] = useState('Admin Logistic');
  const [mutOutlet, setMutOutlet] = useState('Semua Outlet');

  // Search & Filter States
  const [invSearch, setInvSearch] = useState('');
  const [invCategoryFilter, setInvCategoryFilter] = useState('ALL');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [poStatusFilter, setPoStatusFilter] = useState('ALL');

  // Modal Visibility States
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [invName, setInvName] = useState('');
  const [invCategory, setInvCategory] = useState('Daging Ayam');
  const [invCurrentStock, setInvCurrentStock] = useState(20);
  const [invMinStock, setInvMinStock] = useState(5);
  const [invUnit, setInvUnit] = useState('Kg');
  const [invUnitPrice, setInvUnitPrice] = useState(42000);
  const [invOutlet, setInvOutlet] = useState('Semua Outlet');
  const [invExpiryDate, setInvExpiryDate] = useState('');
  const [invBatchNumber, setInvBatchNumber] = useState('');

  // Recipe Modal State
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeMenuId, setRecipeMenuId] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeItem[]>([]);
  const [selectedRecipeInvId, setSelectedRecipeInvId] = useState('');
  const [selectedRecipeQty, setSelectedRecipeQty] = useState(0.1);

  // Stock Opname Modal State
  const [showOpnameModal, setShowOpnameModal] = useState(false);
  const [opnameInvId, setOpnameInvId] = useState('');
  const [opnameOutlet, setOpnameOutlet] = useState('Steak 11, Cibubur');
  const [opnameActualStock, setOpnameActualStock] = useState(0);
  const [opnameReason, setOpnameReason] = useState<
    'Bahan Rusak / Spoilage' | 'Kedaluwarsa / Expired' | 'Limbah Dapur / Tumpah' | 'Selisih Hitung Physical' | 'Penyesuaian Manual'
  >('Limbah Dapur / Tumpah');
  const [opnameNotes, setOpnameNotes] = useState('');
  const [opnameUser, setOpnameUser] = useState('Chef / Supervisor Dapur');

  // Stock Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState('Gudang Pusat (Subang)');
  const [transferTo, setTransferTo] = useState('Steak 11, Cibubur');
  const [transferInvId, setTransferInvId] = useState('');
  const [transferQty, setTransferQty] = useState(5);
  const [transferNotes, setTransferNotes] = useState('');
  const [transferUser, setTransferUser] = useState('Admin Logistic');

  // Supplier Form State
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supCategory, setSupCategory] = useState<string>('Daging Ayam Fresh');
  const [supAddress, setSupAddress] = useState('');
  const [supCity, setSupCity] = useState('Subang');
  const [supRating, setSupRating] = useState<number>(5);
  const [supPaymentTerms, setSupPaymentTerms] = useState('TOP 14 Hari');
  const [supNotes, setSupNotes] = useState('');

  // PO Form State
  const [showPoModal, setShowPoModal] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poOutlet, setPoOutlet] = useState('Semua Outlet');
  const [poNotes, setPoNotes] = useState('');
  const [poItems, setPoItems] = useState<PurchaseOrderItem[]>([]);
  const [selectedPoInvId, setSelectedPoInvId] = useState('');
  const [selectedPoQty, setSelectedPoQty] = useState(10);

  // Low stock items count
  const lowStockItems = (inventory || []).filter((item) => item.currentStock <= item.minStock);

  // --- 1. INVENTORY CRUD HANDLERS ---
  const handleOpenAddInventory = () => {
    if (checkReadOnlyPermission()) return;
    setEditingInvId(null);
    setInvName('');
    setInvCategory('Daging Ayam');
    setInvCurrentStock(20);
    setInvMinStock(5);
    setInvUnit('Kg');
    setInvUnitPrice(42000);
    setInvOutlet((outletsList && outletsList[0]) || 'Semua Outlet');
    setInvExpiryDate('');
    setInvBatchNumber('');
    setShowInventoryModal(true);
  };

  const handleOpenEditInventory = (item: InventoryItem) => {
    if (checkReadOnlyPermission()) return;
    setEditingInvId(item.id);
    setInvName(item.name);
    setInvCategory(item.category);
    setInvCurrentStock(item.currentStock);
    setInvMinStock(item.minStock);
    setInvUnit(item.unit);
    setInvUnitPrice(item.unitPrice);
    setInvOutlet(item.outlet);
    setInvExpiryDate(item.expiryDate || '');
    setInvBatchNumber(item.batchNumber || '');
    setShowInventoryModal(true);
  };

  const handleSaveInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkReadOnlyPermission()) return;
    if (!invName.trim()) {
      showToast('⚠️ Nama bahan baku wajib diisi!');
      return;
    }

    let updated: InventoryItem[];
    const todayStr = new Date().toISOString().split('T')[0];

    if (editingInvId) {
      updated = inventory.map((item) =>
        item.id === editingInvId
          ? {
              ...item,
              name: invName.trim(),
              category: invCategory,
              currentStock: Number(invCurrentStock),
              minStock: Number(invMinStock),
              unit: invUnit,
              unitPrice: Number(invUnitPrice),
              outlet: invOutlet,
              expiryDate: invExpiryDate || undefined,
              batchNumber: invBatchNumber || undefined,
            }
          : item
      );
      showToast(`✅ Bahan baku "${invName}" berhasil diperbarui.`);
    } else {
      const newItem: InventoryItem = {
        id: `INV-${String((inventory || []).length + 1).padStart(3, '0')}`,
        name: invName.trim(),
        category: invCategory,
        currentStock: Number(invCurrentStock),
        minStock: Number(invMinStock),
        unit: invUnit,
        unitPrice: Number(invUnitPrice),
        outlet: invOutlet,
        lastRestockDate: todayStr,
        expiryDate: invExpiryDate || undefined,
        batchNumber: invBatchNumber || undefined,
      };
      updated = [newItem, ...inventory];
      showToast(`🎉 Bahan baku baru "${invName}" berhasil ditambahkan!`);
    }

    setInventory(updated);
    saveInventoryData(updated);
    setShowInventoryModal(false);
  };

  const handleDeleteInventory = (id: string, name: string) => {
    if (checkReadOnlyPermission()) return;
    setDeleteConfirmTarget({
      type: 'inventory',
      id,
      title: `Hapus Bahan Baku "${name}"?`,
      description: 'Data bahan baku ini akan dihapus permanen dari inventaris.',
    });
  };

  // --- 2. RECIPE (BOM) HANDLERS ---
  const handleOpenEditRecipe = (menu: MenuItem) => {
    setRecipeMenuId(menu.id);
    const existing = recipes.find((r) => r.menuId === menu.id);
    if (existing) {
      setRecipeIngredients(existing.ingredients);
    } else {
      setRecipeIngredients([]);
    }
    setSelectedRecipeInvId(inventory[0]?.id || '');
    setSelectedRecipeQty(0.1);
    setShowRecipeModal(true);
  };

  const handleAddRecipeIngredient = () => {
    if (!selectedRecipeInvId) return;
    const inv = inventory.find((i) => i.id === selectedRecipeInvId);
    if (!inv) return;

    const existingIdx = recipeIngredients.findIndex((ri) => ri.inventoryItemId === selectedRecipeInvId);
    if (existingIdx >= 0) {
      const copy = [...recipeIngredients];
      copy[existingIdx].quantityNeeded += Number(selectedRecipeQty);
      setRecipeIngredients(copy);
    } else {
      setRecipeIngredients([
        ...recipeIngredients,
        {
          inventoryItemId: inv.id,
          inventoryItemName: inv.name,
          quantityNeeded: Number(selectedRecipeQty),
          unit: inv.unit,
        },
      ]);
    }
  };

  const handleRemoveRecipeIngredient = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, idx) => idx !== index));
  };

  const handleSaveRecipe = () => {
    const targetMenu = menuItems.find((m) => m.id === recipeMenuId);
    if (!targetMenu) return;

    // Calculate total COGS / HPP
    const calculatedCogs = recipeIngredients.reduce((sum, item) => {
      const inv = inventory.find((i) => i.id === item.inventoryItemId);
      const price = inv ? inv.unitPrice : 0;
      return sum + item.quantityNeeded * price;
    }, 0);

    const newRecipe: MenuRecipe = {
      menuId: targetMenu.id,
      menuName: targetMenu.name,
      ingredients: recipeIngredients,
    };

    const existingIdx = recipes.findIndex((r) => r.menuId === targetMenu.id);
    let updatedRecipes: MenuRecipe[];
    if (existingIdx >= 0) {
      updatedRecipes = recipes.map((r) => (r.menuId === targetMenu.id ? newRecipe : r));
    } else {
      updatedRecipes = [...recipes, newRecipe];
    }

    setRecipes(updatedRecipes);
    saveRecipes(updatedRecipes);

    // Auto update HPP / COGS in MenuItem
    if (calculatedCogs > 0) {
      const updatedMenus = menuItems.map((m) =>
        m.id === targetMenu.id ? { ...m, cogs: Math.round(calculatedCogs) } : m
      );
      setMenuItems(updatedMenus);
      saveMenuItems(updatedMenus);
    }

    setShowRecipeModal(false);
    showToast(`👨‍🍳 Resep BOM "${targetMenu.name}" disimpan. HPP dihitung: ${formatRupiah(calculatedCogs)}`);
  };

  // --- 3. STOCK OPNAME HANDLERS ---
  const handleOpenOpname = (invItem?: InventoryItem) => {
    if (checkReadOnlyPermission()) return;
    const target = invItem || inventory[0];
    if (target) {
      setOpnameInvId(target.id);
      setOpnameActualStock(target.currentStock);
      setOpnameOutlet(target.outlet === 'Semua Outlet' ? (outletsList && outletsList[0]) || 'Steak 11, Cibubur' : target.outlet);
    }
    setOpnameReason('Limbah Dapur / Tumpah');
    setOpnameNotes('');
    setShowOpnameModal(true);
  };

  const handleSaveOpname = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkReadOnlyPermission()) return;
    const inv = inventory.find((i) => i.id === opnameInvId);
    if (!inv) return;

    const diff = Number(opnameActualStock) - inv.currentStock;
    const now = new Date();

    const newOpnameLog: StockOpnameLog = {
      id: `SOP-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String((stockOpnames || []).length + 1).padStart(3, '0')}`,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      inventoryItemId: inv.id,
      inventoryItemName: inv.name,
      outlet: opnameOutlet,
      systemStock: inv.currentStock,
      actualStock: Number(opnameActualStock),
      difference: diff,
      reason: opnameReason,
      notes: opnameNotes.trim(),
      performedBy: opnameUser.trim() || 'Auditor Dapur',
    };

    // Update current stock in inventory
    const updatedInventory = inventory.map((i) =>
      i.id === inv.id ? { ...i, currentStock: Number(opnameActualStock) } : i
    );

    const updatedOpnames = [newOpnameLog, ...stockOpnames];

    // Auto record stock mutation for Stock Opname
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const newMut: StockMutation = {
      id: `MUT-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String((stockMutations || []).length + 1).padStart(3, '0')}`,
      timestamp: `${dateStr} ${timeStr}`,
      date: dateStr,
      inventoryItemId: inv.id,
      inventoryItemName: inv.name,
      outlet: opnameOutlet,
      mutationType: 'Keluar (Opname/Limbah)',
      quantity: diff,
      unit: inv.unit,
      stockBefore: inv.currentStock,
      stockAfter: Number(opnameActualStock),
      referenceNo: newOpnameLog.id,
      notes: `Opname: ${opnameReason}${opnameNotes ? ' - ' + opnameNotes : ''}`,
      performedBy: opnameUser.trim() || 'Auditor Dapur'
    };
    const updatedMutations = [newMut, ...(stockMutations || [])];
    setStockMutations(updatedMutations);
    saveStockMutations(updatedMutations);

    setInventory(updatedInventory);
    saveInventoryData(updatedInventory);
    setStockOpnames(updatedOpnames);
    saveStockOpnames(updatedOpnames);

    setShowOpnameModal(false);

    recordAuditLog({
      user: currentUser?.name || opnameUser.trim() || 'Auditor Dapur',
      role: currentUser?.role || 'Staff Logistik',
      outlet: opnameOutlet,
      category: 'Kelola Stok',
      action: 'Stock Opname',
      details: `Opname ${inv.name}: Fisik ${opnameActualStock} ${inv.unit} (Selisih: ${diff > 0 ? '+' : ''}${diff})`,
      status: 'Berhasil',
    });

    showToast(`📋 Stock Opname "${inv.name}" berhasil dicatat (Selisih: ${diff > 0 ? '+' : ''}${diff} ${inv.unit}).`);
  };

  // --- 4. STOCK TRANSFER HANDLERS ---
  const handleOpenTransfer = (invItem?: InventoryItem) => {
    if (checkReadOnlyPermission()) return;
    const target = invItem || inventory[0];
    if (target) {
      setTransferInvId(target.id);
    }
    setTransferFrom('Gudang Pusat (Subang)');
    setTransferTo((outletsList && outletsList[0]) || 'Steak 11, Cibubur');
    setTransferQty(5);
    setTransferNotes('');
    setShowTransferModal(true);
  };

  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkReadOnlyPermission()) return;
    const inv = inventory.find((i) => i.id === transferInvId);
    if (!inv) return;

    if (transferFrom === transferTo) {
      showToast('⚠️ Outlet asal dan outlet tujuan tidak boleh sama!');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const newTransfer: StockTransfer = {
      id: `TRF-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String((stockTransfers || []).length + 1).padStart(3, '0')}`,
      date: dateStr,
      fromOutlet: transferFrom,
      toOutlet: transferTo,
      inventoryItemId: inv.id,
      inventoryItemName: inv.name,
      quantity: Number(transferQty),
      unit: inv.unit,
      status: 'Selesai / Diterima', // Instant transfer simulation
      notes: transferNotes.trim(),
      sentBy: transferUser,
      receivedBy: 'Tim Dapur Target',
    };

    const updatedTransfers = [newTransfer, ...stockTransfers];
    setStockTransfers(updatedTransfers);
    saveStockTransfers(updatedTransfers);

    // Auto record stock mutation for transfer
    const newMut: StockMutation = {
      id: `MUT-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String((stockMutations || []).length + 1).padStart(3, '0')}`,
      timestamp: `${dateStr} ${timeStr}`,
      date: dateStr,
      inventoryItemId: inv.id,
      inventoryItemName: inv.name,
      outlet: `${transferFrom} ➔ ${transferTo}`,
      mutationType: 'Masuk (Transfer Outlet)',
      quantity: Number(transferQty),
      unit: inv.unit,
      stockBefore: inv.currentStock,
      stockAfter: inv.currentStock + Number(transferQty),
      referenceNo: newTransfer.id,
      notes: `Transfer stok dari ${transferFrom} ke ${transferTo}${transferNotes ? ': ' + transferNotes : ''}`,
      performedBy: transferUser || 'Tim Pengirim'
    };
    const updatedMutations = [newMut, ...(stockMutations || [])];
    setStockMutations(updatedMutations);
    saveStockMutations(updatedMutations);

    setShowTransferModal(false);

    recordAuditLog({
      user: currentUser?.name || transferUser || 'Staff Logistik',
      role: currentUser?.role || 'Staff Logistik',
      outlet: transferFrom,
      category: 'Kelola Stok',
      action: 'Transfer Stok',
      details: `Transfer ${inv.name} (${transferQty} ${inv.unit}) dari ${transferFrom} ke ${transferTo}`,
      status: 'Berhasil',
    });

    showToast(`🚚 Transfer Stok "${inv.name}" sebesar ${transferQty} ${inv.unit} berhasil dicatat.`);
  };

  // --- MANUAL MUTATION HANDLERS ---
  const handleOpenMutation = (invItem?: InventoryItem) => {
    const target = invItem || inventory[0];
    if (target) {
      setMutInvId(target.id);
      setMutOutlet(target.outlet === 'Semua Outlet' ? (outletsList && outletsList[0]) || 'Steak 11, Cibubur' : target.outlet);
    }
    setMutType('Masuk (Penyesuaian)');
    setMutQty(1);
    setMutNotes('');
    setShowMutationModal(true);
  };

  const handleSaveMutation = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = inventory.find((i) => i.id === mutInvId);
    if (!inv) {
      showToast('⚠️ Pilih bahan baku terlebih dahulu!');
      return;
    }
    if (mutQty <= 0) {
      showToast('⚠️ Jumlah mutasi harus lebih dari 0!');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const timestampStr = `${dateStr} ${timeStr}`;

    const isMasuk = mutType.startsWith('Masuk');
    const deltaQty = isMasuk ? Number(mutQty) : -Number(mutQty);

    const stockBefore = inv.currentStock;
    const stockAfter = Math.max(0, stockBefore + deltaQty);

    const newMut: StockMutation = {
      id: `MUT-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String((stockMutations || []).length + 1).padStart(3, '0')}`,
      timestamp: timestampStr,
      date: dateStr,
      inventoryItemId: inv.id,
      inventoryItemName: inv.name,
      outlet: mutOutlet || inv.outlet,
      mutationType: mutType,
      quantity: deltaQty,
      unit: inv.unit,
      stockBefore,
      stockAfter,
      referenceNo: `MAN-${Date.now().toString().slice(-6)}`,
      notes: mutNotes.trim(),
      performedBy: mutUser || 'Admin Logistic',
    };

    // Update inventory stock
    const updatedInv = inventory.map((item) =>
      item.id === inv.id ? { ...item, currentStock: stockAfter, lastRestockDate: dateStr } : item
    );
    setInventory(updatedInv);
    saveInventoryData(updatedInv);

    // Update stock mutations
    const updatedMutations = [newMut, ...stockMutations];
    setStockMutations(updatedMutations);
    saveStockMutations(updatedMutations);

    setShowMutationModal(false);
    showToast(`📊 Mutasi stok "${inv.name}" berhasil dicatat (${deltaQty > 0 ? '+' : ''}${deltaQty} ${inv.unit}). Stok terbaru: ${stockAfter} ${inv.unit}`);
  };

  // --- 5. SUPPLIER CRUD HANDLERS ---
  const handleOpenAddSupplier = () => {
    setEditingSupplierId(null);
    setSupName('');
    setSupContact('');
    setSupPhone('');
    setSupEmail('');
    setSupCategory('Daging Ayam Fresh');
    setSupAddress('');
    setSupCity('Subang');
    setSupRating(5);
    setSupPaymentTerms('TOP 14 Hari');
    setSupNotes('');
    setShowSupplierModal(true);
  };

  const handleOpenEditSupplier = (sup: Supplier) => {
    setEditingSupplierId(sup.id);
    setSupName(sup.name);
    setSupContact(sup.contactPerson);
    setSupPhone(sup.phone);
    setSupEmail(sup.email || '');
    setSupCategory(sup.category);
    setSupAddress(sup.address);
    setSupCity(sup.city || '');
    setSupRating(sup.rating);
    setSupPaymentTerms(sup.paymentTerms || 'COD');
    setSupNotes(sup.notes || '');
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim() || !supPhone.trim()) {
      showToast('⚠️ Nama supplier dan nomor telepon wajib diisi!');
      return;
    }

    let updated: Supplier[];
    if (editingSupplierId) {
      updated = suppliers.map((s) =>
        s.id === editingSupplierId
          ? {
              ...s,
              name: supName.trim(),
              contactPerson: supContact.trim(),
              phone: supPhone.trim(),
              email: supEmail.trim(),
              category: supCategory,
              address: supAddress.trim(),
              city: supCity.trim(),
              rating: supRating,
              paymentTerms: supPaymentTerms,
              notes: supNotes.trim(),
            }
          : s
      );
      showToast(`✅ Supplier "${supName}" diperbarui.`);
    } else {
      const newSup: Supplier = {
        id: `SUP-${String((suppliers || []).length + 1).padStart(3, '0')}`,
        name: supName.trim(),
        contactPerson: supContact.trim(),
        phone: supPhone.trim(),
        email: supEmail.trim(),
        category: supCategory,
        address: supAddress.trim(),
        city: supCity.trim(),
        rating: supRating,
        paymentTerms: supPaymentTerms,
        notes: supNotes.trim(),
        status: 'Aktif',
      };
      updated = [newSup, ...suppliers];
      showToast(`🎉 Supplier baru "${supName}" ditambahkan!`);
    }

    setSuppliers(updated);
    saveSuppliersData(updated);
    setShowSupplierModal(false);
  };

  const handleDeleteSupplier = (id: string, name: string) => {
    setDeleteConfirmTarget({
      type: 'supplier',
      id,
      title: `Hapus Supplier "${name}"?`,
      description: 'Data mitra supplier ini akan dihapus dari daftar kontak.',
    });
  };

  // --- 6. PURCHASE ORDER HANDLERS ---
  const handleOpenAddPo = (prefillSupplierId?: string, prefillItems?: { invId: string; qty: number }[]) => {
    const defaultSup = prefillSupplierId || suppliers[0]?.id || '';
    setPoSupplierId(defaultSup);
    setPoOutlet('Semua Outlet');
    setPoNotes('');

    if (prefillItems && prefillItems.length > 0) {
      const items: PurchaseOrderItem[] = [];
      prefillItems.forEach((p) => {
        const inv = inventory.find((i) => i.id === p.invId);
        if (inv) {
          items.push({
            inventoryItemId: inv.id,
            itemName: inv.name,
            unit: inv.unit,
            quantity: p.qty,
            unitPrice: inv.unitPrice,
            subtotal: p.qty * inv.unitPrice,
          });
        }
      });
      setPoItems(items);
    } else {
      setPoItems([]);
    }
    setShowPoModal(true);
  };

  const handleAddPoItem = () => {
    if (!selectedPoInvId) return;
    const inv = inventory.find((i) => i.id === selectedPoInvId);
    if (!inv) return;

    const existingIdx = poItems.findIndex((pi) => pi.inventoryItemId === selectedPoInvId);
    if (existingIdx >= 0) {
      const copy = [...poItems];
      copy[existingIdx].quantity += selectedPoQty;
      copy[existingIdx].subtotal = copy[existingIdx].quantity * copy[existingIdx].unitPrice;
      setPoItems(copy);
    } else {
      setPoItems([
        ...poItems,
        {
          inventoryItemId: inv.id,
          itemName: inv.name,
          unit: inv.unit,
          quantity: selectedPoQty,
          unitPrice: inv.unitPrice,
          subtotal: selectedPoQty * inv.unitPrice,
        },
      ]);
    }
  };

  const handleRemovePoItem = (index: number) => {
    setPoItems(poItems.filter((_, idx) => idx !== index));
  };

  const handleSavePo = () => {
    if (!poSupplierId) {
      showToast('⚠️ Pilih supplier terlebih dahulu!');
      return;
    }
    if (poItems.length === 0) {
      showToast('⚠️ Tambahkan minimal 1 item pesanan!');
      return;
    }

    const sup = suppliers.find((s) => s.id === poSupplierId);
    const totalAmount = poItems.reduce((sum, item) => sum + item.subtotal, 0);

    const newPo: PurchaseOrder = {
      id: `PO-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String((purchaseOrders || []).length + 1).padStart(3, '0')}`,
      supplierId: poSupplierId,
      supplierName: sup?.name || 'Supplier Utama',
      outlet: poOutlet,
      orderDate: new Date().toISOString().split('T')[0],
      items: poItems,
      totalAmount,
      status: 'Dipesan',
      paymentStatus: 'Belum Lunas',
      notes: poNotes.trim(),
      createdBy: 'Manager Operasional',
    };

    const updatedPos = [newPo, ...purchaseOrders];
    setPurchaseOrders(updatedPos);
    savePurchaseOrdersData(updatedPos);
    setShowPoModal(false);

    recordAuditLog({
      user: currentUser?.name || 'Manager Operasional',
      role: currentUser?.role || 'Manager Operasional',
      outlet: newPo.outlet,
      category: 'Kelola Stok',
      action: 'Buat Purchase Order',
      details: `PO #${newPo.id} (${newPo.supplierName}) senilai ${formatRupiah(newPo.totalAmount)}`,
      status: 'Berhasil',
    });

    showToast(`📦 Purchase Order "${newPo.id}" berhasil dibuat.`);
  };

  const handleUpdatePoStatus = (poId: string, newStatus: 'Draft' | 'Dipesan' | 'Diterima' | 'Dibatalkan') => {
    const targetPo = purchaseOrders.find((p) => p.id === poId);
    if (!targetPo) return;

    // Auto update inventory when status changes to Diterima!
    if (newStatus === 'Diterima' && targetPo.status !== 'Diterima') {
      const todayStr = new Date().toISOString().split('T')[0];
      const updatedInv = [...inventory];

      (targetPo.items || []).forEach((item) => {
        const invIdx = updatedInv.findIndex((i) => i.id === item.inventoryItemId);
        if (invIdx >= 0) {
          updatedInv[invIdx] = {
            ...updatedInv[invIdx],
            currentStock: updatedInv[invIdx].currentStock + item.quantity,
            lastRestockDate: todayStr,
          };
        }
      });

      setInventory(updatedInv);
      saveInventoryData(updatedInv);
      showToast(`🎉 Stok otomatis diperbarui di Inventaris (+ Restock Diterima)!`);
    }

    const updatedPos = purchaseOrders.map((p) =>
      p.id === poId
        ? {
            ...p,
            status: newStatus,
            receivedDate: newStatus === 'Diterima' ? new Date().toISOString().split('T')[0] : p.receivedDate,
            paymentStatus: newStatus === 'Diterima' ? 'Lunas' : p.paymentStatus,
          }
        : p
    );

    setPurchaseOrders(updatedPos);
    savePurchaseOrdersData(updatedPos);
    showToast(`Status PO "${poId}" diubah menjadi "${newStatus}"`);
  };

  const handleSendWaPo = (po: PurchaseOrder) => {
    const sup = suppliers.find((s) => s.id === po.supplierId);
    const targetPhone = sup?.phone || '';
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;

    const itemsText = po.items
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.itemName}*: ${item.quantity} ${item.unit} @ ${formatRupiah(item.unitPrice)} = *${formatRupiah(item.subtotal)}*`
      )
      .join('\n');

    const message =
      `*PURCHASE ORDER - STEAK 11*\n\n` +
      `*No. PO:* ${po.id}\n` +
      `*Tanggal:* ${po.orderDate}\n` +
      `*Kepada:* ${po.supplierName}\n` +
      `*Outlet Tujuan:* ${po.outlet}\n\n` +
      `*DAFTAR ITEM PESANAN:*\n${itemsText}\n\n` +
      `*TOTAL PEMBELIAN:* ${formatRupiah(po.totalAmount)}\n` +
      `*Catatan:* ${po.notes || 'Mohon dikirimkan segar & tersegel.'}\n\n` +
      `Mohon dikonfirmasi & diproses. Terima kasih!`;

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Filtered inventory items
  const filteredInventory = (inventory || []).filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(invSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(invSearch.toLowerCase()) ||
      item.outlet.toLowerCase().includes(invSearch.toLowerCase());
    const matchesCategory = invCategoryFilter === 'ALL' || item.category === invCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Context Banner */}
      <div className="bg-white dark:bg-[#180B24] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-amber-400 shrink-0">
            {['inventory', 'recipes', 'stock_opname', 'stock_transfers'].includes(subTab) ? (
              <Boxes className="w-6 h-6 text-orange-500" />
            ) : (
              <Truck className="w-6 h-6 text-purple-600 dark:text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#3D1259] dark:text-amber-400 font-baloo">
                {['inventory', 'recipes', 'stock_opname', 'stock_transfers'].includes(subTab)
                  ? 'Manajemen Stok & Persediaan Internal'
                  : 'Supply Chain & Pengadaan Barang (Procurement)'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                {['inventory', 'recipes', 'stock_opname', 'stock_transfers'].includes(subTab) ? 'Internal Gudang' : 'Eksternal Vendor'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              {['inventory', 'recipes', 'stock_opname', 'stock_transfers'].includes(subTab)
                ? 'Pengelolaan stok fisik bahan baku di gudang & dapur outlet, racikan resep (BOM), audit opname/limbah, dan transfer stok antar cabang.'
                : 'Pengelolaan rantai pasok eksternal, manajemen vendor & supplier mitra, penerbitan Purchase Order (PO), serta tracking restock dari supplier.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-purple-950/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {['inventory', 'recipes', 'stock_opname', 'stock_transfers'].includes(subTab)
              ? 'Fokus: Operasional Internal'
              : 'Fokus: Relasi Pemasok & PO'}
          </span>
        </div>
      </div>

      {/* Sub-Header Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-900">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSubTab('inventory')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'inventory'
                ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <Boxes className="w-4 h-4 text-orange-400" />
            <span>Stok Gudang ({(inventory || []).length})</span>
            {(lowStockItems || []).length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] animate-pulse">
                {(lowStockItems || []).length} Tipis
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('recipes')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'recipes'
                ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <ChefHat className="w-4 h-4 text-amber-400" />
            <span>Resep & BOM Menu ({(recipes || []).length})</span>
          </button>

          <button
            onClick={() => setSubTab('stock_opname')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'stock_opname'
                ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-emerald-400" />
            <span>Audit Opname & Limbah</span>
          </button>

          <button
            onClick={() => setSubTab('stock_transfers')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'stock_transfers'
                ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            <span>Transfer Stok Outlet</span>
          </button>

          <button
            onClick={() => setSubTab('stock_card')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'stock_card'
                ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>Kartu Stok / Mutasi Stok</span>
          </button>

          <button
            onClick={() => setSubTab('suppliers')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'suppliers'
                ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <Truck className="w-4 h-4 text-purple-400" />
            <span>Supplier Mitra</span>
          </button>

          <button
            onClick={() => setSubTab('purchase_orders')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'purchase_orders'
                ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-amber-400" />
            <span>Purchase Order (PO)</span>
          </button>
        </div>

        {/* Action Button depending on subtab */}
        {subTab === 'inventory' && (
          <button
            onClick={handleOpenAddInventory}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Bahan</span>
          </button>
        )}

        {subTab === 'stock_opname' && (
          <button
            onClick={() => handleOpenOpname()}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Opname</span>
          </button>
        )}

        {subTab === 'stock_transfers' && (
          <button
            onClick={() => handleOpenTransfer()}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Transfer Stok</span>
          </button>
        )}

        {subTab === 'suppliers' && (
          <button
            onClick={handleOpenAddSupplier}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Supplier</span>
          </button>
        )}

        {subTab === 'purchase_orders' && (
          <button
            onClick={() => handleOpenAddPo()}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah PO</span>
          </button>
        )}
      </div>

      {/* SUB-TAB 1: GUDANG & STOK BAHAN BAKU */}
      {subTab === 'inventory' && (
        <div className="space-y-6">
          {/* Low Stock Banner Alert */}
          {lowStockItems.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 animate-bounce" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-amber-300">
                    Peringatan Restock ({lowStockItems.length} Bahan Baku Mendekati Batas Minimum)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Bahan paha ayam, saus racikan, atau kemasan di bawah buffer aman. Disarankan segera terbitkan Purchase Order.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const items = lowStockItems.map((i) => ({
                    invId: i.id,
                    qty: Math.max(10, Math.ceil(i.minStock * 2 - i.currentStock)),
                  }));
                  handleOpenAddPo(suppliers[0]?.id, items);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shrink-0 flex items-center gap-1.5 cursor-pointer shadow"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Buat PO Restock Otomatis</span>
              </button>
            </div>
          )}

          {/* Search and Category Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama bahan baku, kategori, atau outlet..."
                value={invSearch}
                onChange={(e) => setInvSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-bold text-slate-400">Kategori:</span>
              {['ALL', 'Daging Ayam', 'Bumbu & Saus', 'Sayuran & Karbo', 'Kemasan & Plastik'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setInvCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-extrabold text-xs cursor-pointer transition-all ${
                    invCategoryFilter === cat
                      ? 'bg-purple-800 text-amber-400'
                      : 'bg-slate-100 dark:bg-purple-950 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Full Inventory Table */}
          <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-purple-950/80 text-slate-700 dark:text-amber-300 font-bold border-b border-slate-200 dark:border-purple-900">
                    <th className="p-3.5">ID & Nama Bahan</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Stok Fisik Saat Ini</th>
                    <th className="p-3.5">Batas Min. Stok</th>
                    <th className="p-3.5">Harga / Unit</th>
                    <th className="p-3.5">Lokasi Outlet</th>
                    <th className="p-3.5">Batch / Expired</th>
                    <th className="p-3.5 text-center">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30">
                  {filteredInventory.map((item) => {
                    const isLow = item.currentStock <= item.minStock;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-purple-950/40 transition-colors">
                        <td className="p-3.5 font-extrabold text-slate-800 dark:text-slate-100">
                          {item.name}
                          <span className="block text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-purple-900/60 font-bold text-slate-700 dark:text-amber-300 text-[10px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3.5 font-black text-sm">
                          <div className="flex items-center gap-1.5">
                            <span className={isLow ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                              {item.currentStock} {item.unit}
                            </span>
                            {isLow && (
                              <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[9px] font-black flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> TIPIS
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-slate-500">
                          {item.minStock} {item.unit}
                        </td>
                        <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">
                          {formatRupiah(item.unitPrice)} / {item.unit}
                        </td>
                        <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                          {item.outlet}
                        </td>
                        <td className="p-3.5 text-[11px]">
                          {item.expiryDate ? (
                            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold">
                              📅 {item.expiryDate}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenOpname(item)}
                              title="Audit Stock Opname"
                              className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenTransfer(item)}
                              title="Transfer Stok Antar Outlet"
                              className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditInventory(item)}
                              title="Edit Bahan Baku"
                              className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteInventory(item.id, item.name)}
                              title="Hapus Bahan Baku"
                              className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RESEP MENU & BILL OF MATERIALS (BOM) */}
      {subTab === 'recipes' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-500" />
                Resep & Bill of Materials (BOM) per Porsi Menu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Atur standar takaran paha ayam, bumbu secret, saus, dan kemasan per porsi menu. HPP dihitung otomatis secara realtime dari harga bahan baku.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((menu) => {
              const recipe = recipes.find((r) => r.menuId === menu.id);
              const calculatedCogs = recipe
                ? (recipe.ingredients || []).reduce((sum, ing) => {
                    const inv = inventory.find((i) => i.id === ing.inventoryItemId);
                    return sum + ing.quantityNeeded * (inv?.unitPrice || 0);
                  }, 0)
                : (menu.cogs || Math.round(menu.price * 0.4));

              const marginPct = Math.round(((menu.price - calculatedCogs) / menu.price) * 100);

              return (
                <div
                  key={menu.id}
                  className="bg-white dark:bg-[#1a0c28] p-4 rounded-2xl border border-slate-200 dark:border-purple-900 shadow-sm space-y-3 relative flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-amber-300 uppercase">
                          {menu.category}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 mt-1">
                          {menu.name}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-xs text-slate-900 dark:text-amber-400">
                          {formatRupiah(menu.price)}
                        </span>
                        <span className="block text-[10px] text-emerald-600 font-bold">
                          Margin ~{marginPct}%
                        </span>
                      </div>
                    </div>

                    {/* Calculated HPP */}
                    <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/50 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-bold">Estimasi HPP (BOM):</span>
                      <span className="font-black text-amber-900 dark:text-amber-300 text-sm">
                        {formatRupiah(calculatedCogs)}
                      </span>
                    </div>

                    {/* Ingredients List */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 block">Komposisi Bahan baku:</span>
                      {recipe && (recipe.ingredients || []).length > 0 ? (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {(recipe.ingredients || []).map((ing, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] p-1.5 rounded bg-slate-50 dark:bg-purple-950/50">
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                • {ing.inventoryItemName}
                              </span>
                              <span className="font-bold text-purple-800 dark:text-amber-400">
                                {ing.quantityNeeded} {ing.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Belum ada rincian bahan baku terikat.</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEditRecipe(menu)}
                    className="w-full mt-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 dark:hover:bg-purple-800 text-purple-950 dark:text-amber-300 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Atur Takaran Resep BOM</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: STOCK OPNAME & AUDIT LIMBAH */}
      {subTab === 'stock_opname' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-500" />
                Audit Stock Opname & Pencatatan Limbah (Spoilage)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Pencocokan stok fisik di dapur vs catatan sistem. Menyimpan riwayat penyusutan paha ayam (thawing), saus kadaluwarsa, dan tumpahan.
              </p>
            </div>
            <button
              onClick={() => handleOpenOpname()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-extrabold text-xs hover:bg-emerald-600 shadow transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Catat Stock Opname Baru
            </button>
          </div>

          <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-purple-950/80 text-slate-700 dark:text-amber-300 font-bold border-b border-slate-200 dark:border-purple-900">
                    <th className="p-3.5">No. Audit & Tanggal</th>
                    <th className="p-3.5">Nama Bahan Baku</th>
                    <th className="p-3.5">Outlet Dapur</th>
                    <th className="p-3.5">Stok Sistem</th>
                    <th className="p-3.5">Stok Fisik Hitung</th>
                    <th className="p-3.5">Selisih Varian</th>
                    <th className="p-3.5">Alasan Audit</th>
                    <th className="p-3.5">Petugas Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30">
                  {stockOpnames.map((sop) => (
                    <tr key={sop.id} className="hover:bg-slate-50 dark:hover:bg-purple-950/40">
                      <td className="p-3.5 font-extrabold text-slate-800 dark:text-slate-100">
                        {sop.id}
                        <span className="block text-[10px] text-slate-400 font-medium">{sop.date} ({sop.time})</span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {sop.inventoryItemName}
                      </td>
                      <td className="p-3.5 font-bold text-slate-600 dark:text-slate-300">
                        {sop.outlet}
                      </td>
                      <td className="p-3.5 font-bold text-slate-500">
                        {sop.systemStock}
                      </td>
                      <td className="p-3.5 font-black text-purple-900 dark:text-amber-300">
                        {sop.actualStock}
                      </td>
                      <td className="p-3.5 font-extrabold">
                        {sop.difference === 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">Pas (0)</span>
                        ) : sop.difference > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">+{sop.difference}</span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400">{sop.difference}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold text-[10px]">
                          {sop.reason}
                        </span>
                        {sop.notes && <p className="text-[10px] text-slate-400 italic mt-0.5">{sop.notes}</p>}
                      </td>
                      <td className="p-3.5 font-bold text-slate-600 dark:text-slate-300">
                        👤 {sop.performedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: TRANSFER STOK ANTAR OUTLET */}
      {subTab === 'stock_transfers' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-500" />
                Transfer Stok Antar Gudang & Outlet Cabang
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Kirim pasokan paha ayam fillet atau bumbu rempah rahasia dari Gudang Pusat Subang ke cabang Cibubur, Margonda, dll.
              </p>
            </div>
            <button
              onClick={() => handleOpenTransfer()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-700 shadow transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Kirim Mutasi Stok
            </button>
          </div>

          <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-purple-950/80 text-slate-700 dark:text-amber-300 font-bold border-b border-slate-200 dark:border-purple-900">
                    <th className="p-3.5">ID Transfer & Tgl</th>
                    <th className="p-3.5">Nama Bahan</th>
                    <th className="p-3.5">Outlet Asal</th>
                    <th className="p-3.5">Outlet Tujuan</th>
                    <th className="p-3.5">Jumlah Mutasi</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Pengirim & Penerima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30">
                  {stockTransfers.map((trf) => (
                    <tr key={trf.id} className="hover:bg-slate-50 dark:hover:bg-purple-950/40">
                      <td className="p-3.5 font-extrabold text-slate-800 dark:text-slate-100">
                        {trf.id}
                        <span className="block text-[10px] text-slate-400 font-medium">{trf.date}</span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {trf.inventoryItemName}
                      </td>
                      <td className="p-3.5 font-bold text-slate-600 dark:text-slate-300">
                        🏢 {trf.fromOutlet}
                      </td>
                      <td className="p-3.5 font-bold text-purple-800 dark:text-amber-300">
                        🏬 {trf.toOutlet}
                      </td>
                      <td className="p-3.5 font-black text-sm text-emerald-600 dark:text-emerald-400">
                        {trf.quantity} {trf.unit}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                          {trf.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-500">
                        <p>Kirim: <strong className="text-slate-700 dark:text-slate-200">{trf.sentBy}</strong></p>
                        <p>Terima: <strong className="text-slate-700 dark:text-slate-200">{trf.receivedBy || '-'}</strong></p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: KARTU STOK / MUTASI STOK */}
      {subTab === 'stock_card' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-500" />
                Kartu Stok & Mutasi Realtime (Ledger In/Out)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Laporan jejak mutasi masuk dan keluar bahan baku secara transparan. Mencatat otomatis transaksi POS, PO supplier, transfer outlet, dan opname limbah.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => handleOpenMutation()}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Catat Mutasi Stok Manual
              </button>
              <button
                onClick={() => showToast('📥 Berhasil mengekspor Kartu Stok / Mutasi ke file Excel (.xlsx)!')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" /> Ekspor Excel
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak PDF
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Ref No, Catatan, Bahan..."
                value={cardSearch}
                onChange={(e) => setCardSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-900 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-cyan-500 dark:text-white"
              />
            </div>

            <div>
              <select
                value={cardItemFilter}
                onChange={(e) => setCardItemFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="ALL">Semua Bahan Baku ({inventory.length})</option>
                {inventory.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={cardOutletFilter}
                onChange={(e) => setCardOutletFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="ALL">Semua Outlet / Lokasi</option>
                <option value="Semua Outlet">Gudang Utama / Semua Outlet</option>
                {(outletsList || []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={cardMutationTypeFilter}
                onChange={(e) => setCardMutationTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="ALL">Semua Tipe Mutasi</option>
                <option value="Masuk">Tipe Masuk (+)</option>
                <option value="Keluar">Tipe Keluar (-)</option>
                <option value="Masuk (PO Pembelian)">Masuk (PO Pembelian)</option>
                <option value="Masuk (Transfer Outlet)">Masuk (Transfer Outlet)</option>
                <option value="Masuk (Penyesuaian)">Masuk (Penyesuaian)</option>
                <option value="Keluar (Penjualan POS)">Keluar (Penjualan POS)</option>
                <option value="Keluar (Opname/Limbah)">Keluar (Opname/Limbah)</option>
              </select>
            </div>
          </div>

          {/* Table Ledger Mutasi */}
          <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-purple-950/80 text-slate-700 dark:text-amber-300 font-bold border-b border-slate-200 dark:border-purple-900">
                    <th className="p-3.5">Waktu & Ref No</th>
                    <th className="p-3.5">Bahan Baku</th>
                    <th className="p-3.5">Outlet / Dapur</th>
                    <th className="p-3.5">Jenis Mutasi</th>
                    <th className="p-3.5 text-right">Stok Awal</th>
                    <th className="p-3.5 text-center">Jumlah Mutasi</th>
                    <th className="p-3.5 text-right">Stok Akhir</th>
                    <th className="p-3.5">Catatan & Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30">
                  {stockMutations
                    .filter((m) => {
                      const matchSearch =
                        m.inventoryItemName.toLowerCase().includes(cardSearch.toLowerCase()) ||
                        m.referenceNo.toLowerCase().includes(cardSearch.toLowerCase()) ||
                        (m.notes && m.notes.toLowerCase().includes(cardSearch.toLowerCase())) ||
                        m.performedBy.toLowerCase().includes(cardSearch.toLowerCase());

                      const matchItem = cardItemFilter === 'ALL' || m.inventoryItemId === cardItemFilter;
                      const matchOutlet = cardOutletFilter === 'ALL' || m.outlet.includes(cardOutletFilter);
                      const matchType =
                        cardMutationTypeFilter === 'ALL' ||
                        (cardMutationTypeFilter === 'Masuk' && m.quantity > 0) ||
                        (cardMutationTypeFilter === 'Keluar' && m.quantity < 0) ||
                        m.mutationType === cardMutationTypeFilter;

                      return matchSearch && matchItem && matchOutlet && matchType;
                    })
                    .map((m) => {
                      const isPositive = m.quantity >= 0;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-purple-950/40">
                          <td className="p-3.5 font-extrabold text-slate-800 dark:text-slate-100">
                            <span className="font-mono text-purple-900 dark:text-amber-300 block">{m.referenceNo}</span>
                            <span className="text-[10px] text-slate-400 font-medium block">{m.timestamp || m.date}</span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                            {m.inventoryItemName}
                          </td>
                          <td className="p-3.5 font-bold text-slate-600 dark:text-slate-300">
                            {m.outlet}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold flex items-center gap-1 w-fit ${
                                isPositive
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              }`}
                            >
                              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                              {m.mutationType}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-medium text-slate-500">
                            {m.stockBefore} {m.unit}
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`text-xs font-black px-2 py-0.5 rounded ${
                                isPositive ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' : 'text-rose-600 bg-rose-50 dark:bg-rose-950'
                              }`}
                            >
                              {isPositive ? `+${m.quantity}` : m.quantity} {m.unit}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-black text-slate-900 dark:text-amber-300">
                            {m.stockAfter} {m.unit}
                          </td>
                          <td className="p-3.5 text-[11px] text-slate-600 dark:text-slate-300">
                            <p className="italic text-slate-500">{m.notes || '-'}</p>
                            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">👤 {m.performedBy}</span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: SUPPLIER MANAGEMENT */}
      {subTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama supplier, kontak, kategori..."
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 text-slate-800 dark:text-slate-100"
              />
            </div>
            <p className="text-xs text-slate-500">
              Total <span className="font-bold text-slate-800 dark:text-amber-400">{(suppliers || []).length}</span> Supplier Terdaftar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {sup.category}
                    </span>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mt-1">
                      {sup.name}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      Contact: <span className="font-bold text-slate-700 dark:text-slate-300">{sup.contactPerson}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-400/20 px-2 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-black text-xs text-purple-950 dark:text-amber-300">{sup.rating}.0</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-100 dark:border-purple-900/50">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{sup.phone}</span>
                  </div>
                  {sup.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      <span>{sup.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{sup.address}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-200 dark:border-purple-800">
                    <span className="text-slate-400">Syarat Bayar:</span>
                    <span className="font-bold text-purple-700 dark:text-amber-300">{sup.paymentTerms}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-purple-900/50">
                  <button
                    onClick={() => {
                      const cleanPhone = sup.phone.replace(/[^0-9]/g, '');
                      const formattedPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
                      window.open(`https://wa.me/${formattedPhone}`, '_blank');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenAddPo(sup.id)}
                      className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                      title="Buat Purchase Order (PO)"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditSupplier(sup)}
                      className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                      title="Edit Data Supplier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(sup.id, sup.name)}
                      className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                      title="Hapus Supplier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: PURCHASE ORDERS */}
      {subTab === 'purchase_orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Filter Status PO:</span>
              {['ALL', 'Dipesan', 'Diterima', 'Dibatalkan'].map((st) => (
                <button
                  key={st}
                  onClick={() => setPoStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-extrabold text-xs cursor-pointer ${
                    poStatusFilter === st
                      ? 'bg-purple-800 text-amber-400'
                      : 'bg-slate-100 dark:bg-purple-950 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {st === 'ALL' ? 'Semua' : st}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Total <span className="font-bold text-slate-800 dark:text-amber-400">{(purchaseOrders || []).length}</span> PO
            </p>
          </div>

          <div className="space-y-3">
            {purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-purple-900/50 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 font-mono">
                        {po.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 font-bold text-[10px] text-purple-800 dark:text-amber-300">
                        {po.outlet}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Supplier: <strong className="text-slate-800 dark:text-slate-200">{po.supplierName}</strong> • Tanggal: {po.orderDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black ${
                        po.status === 'Diterima'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : po.status === 'Dipesan'
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {po.status}
                    </span>

                    <button
                      onClick={() => handleSendWaPo(po)}
                      className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                      title="Kirim PO ke WhatsApp Supplier"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-purple-950/40 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-500 mb-1">Rincian Barang Dipesan:</div>
                  {(po.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700 dark:text-slate-200">
                      <span>• {item.itemName} ({item.quantity} {item.unit})</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-purple-800 font-extrabold text-sm">
                    <span>Total PO:</span>
                    <span className="text-purple-900 dark:text-amber-300">{formatRupiah(po.totalAmount)}</span>
                  </div>
                </div>

                {po.status === 'Dipesan' && (
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleUpdatePoStatus(po.id, 'Diterima')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-extrabold text-xs hover:bg-emerald-600 cursor-pointer shadow"
                    >
                      ✓ Terima Pesanan (Auto Restock)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODALS SECTION --- */}

      {/* 1. INVENTORY ADD/EDIT MODAL */}
      {showInventoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f0e30] rounded-3xl border border-slate-200 dark:border-purple-900 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
              {editingInvId ? 'Edit Data Bahan Baku' : 'Tambah Bahan Baku Baru'}
            </h3>

            <form onSubmit={handleSaveInventory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nama Bahan Baku *</label>
                <input
                  type="text"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  placeholder="Contoh: Fillet Paha Ayam Boneless"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Kategori</label>
                  <select
                    value={invCategory}
                    onChange={(e) => setInvCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  >
                    <option value="Daging Ayam">Daging Ayam</option>
                    <option value="Bumbu & Saus">Bumbu & Saus</option>
                    <option value="Sayuran & Karbo">Sayuran & Karbo</option>
                    <option value="Kemasan & Plastik">Kemasan & Plastik</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Satuan Unit</label>
                  <input
                    type="text"
                    value={invUnit}
                    onChange={(e) => setInvUnit(e.target.value)}
                    placeholder="Kg, Liter, Pcs, Pack"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Stok Saat Ini</label>
                  <input
                    type="number"
                    step="0.1"
                    value={invCurrentStock}
                    onChange={(e) => setInvCurrentStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Batas Min. Stok (Reorder Point)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={invMinStock}
                    onChange={(e) => setInvMinStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Harga Beli per Unit (Rp)</label>
                  <input
                    type="number"
                    value={invUnitPrice}
                    onChange={(e) => setInvUnitPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold text-amber-600 dark:text-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Lokasi Outlet</label>
                  <select
                    value={invOutlet}
                    onChange={(e) => setInvOutlet(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  >
                    <option value="Semua Outlet">Semua Outlet</option>
                    {(outletsList || []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Tanggal Expired (Opsional)</label>
                  <input
                    type="date"
                    value={invExpiryDate}
                    onChange={(e) => setInvExpiryDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">No. Batch (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: BATCH-202608"
                    value={invBatchNumber}
                    onChange={(e) => setInvBatchNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInventoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-950 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black cursor-pointer shadow"
                >
                  Simpan Bahan Baku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. RECIPE (BOM) MODAL */}
      {showRecipeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f0e30] rounded-3xl border border-slate-200 dark:border-purple-900 p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
              Atur Resep BOM Menu
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900">
                <label className="font-bold block mb-1">Bahan Baku yang Digunakan:</label>
                <div className="flex gap-2">
                  <select
                    value={selectedRecipeInvId}
                    onChange={(e) => setSelectedRecipeInvId(e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-white dark:bg-purple-950 font-bold"
                  >
                    {inventory.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.unit}) - {formatRupiah(i.unitPrice)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedRecipeQty}
                    onChange={(e) => setSelectedRecipeQty(Number(e.target.value))}
                    className="w-24 p-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-white dark:bg-purple-950 font-bold"
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    onClick={handleAddRecipeIngredient}
                    className="px-3 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold cursor-pointer hover:bg-amber-300"
                  >
                    + Tambah
                  </button>
                </div>
              </div>

              {/* Recipe List */}
              <div className="space-y-2">
                <span className="font-bold block text-slate-700 dark:text-slate-300">
                  Daftar Bahan per 1 Porsi:
                </span>
                {recipeIngredients.map((ing, idx) => {
                  const inv = inventory.find((i) => i.id === ing.inventoryItemId);
                  const cost = ing.quantityNeeded * (inv?.unitPrice || 0);

                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">{ing.inventoryItemName}</span>
                        <span className="block text-[11px] text-slate-500">
                          {ing.quantityNeeded} {ing.unit} x {formatRupiah(inv?.unitPrice || 0)} ={' '}
                          <strong className="text-amber-600 dark:text-amber-400">{formatRupiah(cost)}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipeIngredient(idx)}
                        className="p-1 rounded text-rose-500 hover:bg-rose-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
                <button
                  type="button"
                  onClick={() => setShowRecipeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-950 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveRecipe}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-black hover:bg-amber-300 cursor-pointer shadow"
                >
                  Simpan Resep & Hitung HPP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. STOCK OPNAME MODAL */}
      {showOpnameModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f0e30] rounded-3xl border border-slate-200 dark:border-purple-900 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
              Catat Audit Stock Opname
            </h3>

            <form onSubmit={handleSaveOpname} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Pilih Bahan Baku</label>
                <select
                  value={opnameInvId}
                  onChange={(e) => {
                    setOpnameInvId(e.target.value);
                    const inv = inventory.find((i) => i.id === e.target.value);
                    if (inv) setOpnameActualStock(inv.currentStock);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                >
                  {inventory.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Stok Sistem: {i.currentStock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Jumlah Stok Fisik Hasil Hitung Ulang</label>
                <input
                  type="number"
                  step="0.1"
                  value={opnameActualStock}
                  onChange={(e) => setOpnameActualStock(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold text-base text-amber-600 dark:text-amber-400"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Alasan Penyesuaian / Audit</label>
                <select
                  value={opnameReason}
                  onChange={(e) => setOpnameReason(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                >
                  <option value="Limbah Dapur / Tumpah">Limbah Dapur / Tumpah</option>
                  <option value="Bahan Rusak / Spoilage">Bahan Rusak / Spoilage</option>
                  <option value="Kedaluwarsa / Expired">Kedaluwarsa / Expired</option>
                  <option value="Selisih Hitung Physical">Selisih Hitung Physical</option>
                  <option value="Penyesuaian Manual">Penyesuaian Manual</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Catatan Auditor</label>
                <textarea
                  value={opnameNotes}
                  onChange={(e) => setOpnameNotes(e.target.value)}
                  placeholder="Misal: Penyusutan lemak paha ayam saat thawing..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOpnameModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-950 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-black hover:bg-emerald-600 cursor-pointer shadow"
                >
                  Simpan Audit Stock Opname
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. STOCK TRANSFER MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f0e30] rounded-3xl border border-slate-200 dark:border-purple-900 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
              Transfer Stok Antar Outlet
            </h3>

            <form onSubmit={handleSaveTransfer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Pilih Bahan Baku</label>
                <select
                  value={transferInvId}
                  onChange={(e) => setTransferInvId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                >
                  {inventory.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Outlet Asal</label>
                  <select
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  >
                    <option value="Gudang Pusat (Subang)">Gudang Pusat (Subang)</option>
                    {(outletsList || []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Outlet Tujuan</label>
                  <select
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  >
                    {(outletsList || []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Jumlah Yang Ditransfer</label>
                <input
                  type="number"
                  step="0.1"
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold text-amber-600 dark:text-amber-400"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Catatan Kurir / Pengiriman</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="Misal: Kirim via armada mobil box pendingin..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-950 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 cursor-pointer shadow"
                >
                  Proses Transfer Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SUPPLIER MODAL */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f0e30] rounded-3xl border border-slate-200 dark:border-purple-900 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
              {editingSupplierId ? 'Edit Supplier' : 'Tambah Supplier Baru'}
            </h3>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nama Perusahaan / Supplier *</label>
                <input
                  type="text"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="Contoh: PT Poultry Fresh Subang"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    placeholder="Contoh: Pak Budi"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">No. WhatsApp / Telepon *</label>
                  <input
                    type="text"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Kategori Utama</label>
                <select
                  value={supCategory}
                  onChange={(e) => setSupCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                >
                  <option value="Daging Ayam Fresh">Daging Ayam Fresh</option>
                  <option value="Bumbu & Rempah">Bumbu & Rempah</option>
                  <option value="Sayuran & Karbo">Sayuran & Karbo</option>
                  <option value="Kemasan & Plastik">Kemasan & Plastik</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Alamat Supplier</label>
                <textarea
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-950 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-black cursor-pointer shadow"
                >
                  Simpan Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. PURCHASE ORDER MODAL */}
      {showPoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f0e30] rounded-3xl border border-slate-200 dark:border-purple-900 p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
              Buat Purchase Order (PO) Baru
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Pilih Supplier</label>
                  <select
                    value={poSupplierId}
                    onChange={(e) => setPoSupplierId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Outlet Tujuan</label>
                  <select
                    value={poOutlet}
                    onChange={(e) => setPoOutlet(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                  >
                    <option value="Semua Outlet">Semua Outlet</option>
                    {(outletsList || []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add Items to PO */}
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900 space-y-2">
                <label className="font-bold block">Pilih Barang Bahan Baku:</label>
                <div className="flex gap-2">
                  <select
                    value={selectedPoInvId}
                    onChange={(e) => setSelectedPoInvId(e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-white dark:bg-purple-950 font-bold"
                  >
                    <option value="">-- Pilih Bahan Baku --</option>
                    {inventory.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.unit}) - {formatRupiah(i.unitPrice)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={selectedPoQty}
                    onChange={(e) => setSelectedPoQty(Number(e.target.value))}
                    className="w-20 p-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-white dark:bg-purple-950 font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddPoItem}
                    className="px-3 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold cursor-pointer hover:bg-amber-300"
                  >
                    + Tambah
                  </button>
                </div>
              </div>

              {/* PO Items List */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {poItems.map((pi, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900"
                  >
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-slate-100">{pi.itemName}</span>
                      <span className="block text-[11px] text-slate-500">
                        {pi.quantity} {pi.unit} x {formatRupiah(pi.unitPrice)} ={' '}
                        <strong className="text-amber-600 dark:text-amber-400">{formatRupiah(pi.subtotal)}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePoItem(idx)}
                      className="p-1 text-rose-500 hover:bg-rose-100 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="font-bold block mb-1">Catatan Tambahan untuk Supplier</label>
                <input
                  type="text"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="Misal: Kirim pagi jam 07.00 WIB dengan kemasan es..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
                <button
                  type="button"
                  onClick={() => setShowPoModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-950 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSavePo}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-black hover:bg-amber-300 cursor-pointer shadow"
                >
                  Simpan Purchase Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL MUTASI STOK */}
      {showMutationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-900">
              <h3 className="font-black text-lg text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-500" />
                Catat Mutasi Stok Manual (Ledger)
              </h3>
              <button
                onClick={() => setShowMutationModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-purple-900 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMutation} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pilih Bahan Baku</label>
                <select
                  value={mutInvId}
                  onChange={(e) => setMutInvId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold dark:text-white"
                  required
                >
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} (Stok Saat Ini: {inv.currentStock} {inv.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tipe Mutasi</label>
                  <select
                    value={mutType}
                    onChange={(e) => setMutType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold dark:text-white"
                  >
                    <option value="Masuk (Penyesuaian)">Masuk (Penyesuaian +)</option>
                    <option value="Masuk (PO Pembelian)">Masuk (PO Pembelian +)</option>
                    <option value="Masuk (Transfer Outlet)">Masuk (Transfer Outlet +)</option>
                    <option value="Keluar (Opname/Limbah)">Keluar (Opname/Limbah -)</option>
                    <option value="Keluar (Transfer Outlet)">Keluar (Transfer Outlet -)</option>
                    <option value="Keluar (Penjualan POS)">Keluar (Penjualan POS -)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Jumlah Mutasi</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={mutQty}
                    onChange={(e) => setMutQty(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Outlet / Dapur Lokasi</label>
                <select
                  value={mutOutlet}
                  onChange={(e) => setMutOutlet(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold dark:text-white"
                >
                  <option value="Semua Outlet">Gudang Utama / Semua Outlet</option>
                  {(outletsList || []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Catatan & Keterangan</label>
                <input
                  type="text"
                  value={mutNotes}
                  onChange={(e) => setMutNotes(e.target.value)}
                  placeholder="Misal: Penerimaan sampel uji rasa / Koreksi timbangan..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Petugas Penanggung Jawab</label>
                <input
                  type="text"
                  value={mutUser}
                  onChange={(e) => setMutUser(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950/60 font-bold dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
                <button
                  type="button"
                  onClick={() => setShowMutationModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-950 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-black cursor-pointer shadow"
                >
                  Simpan Mutasi Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C0D2B] rounded-2xl p-6 max-w-md w-full border border-red-500/30 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/80 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  {deleteConfirmTarget.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {deleteConfirmTarget.description}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-purple-950/50 p-3 rounded-xl border border-slate-200 dark:border-purple-900">
              Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin melanjutkan?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-300 dark:hover:bg-purple-900"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs hover:bg-red-700 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
