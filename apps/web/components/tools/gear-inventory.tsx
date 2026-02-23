'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Guitar,
  Mic,
  Speaker,
  Piano,
  Music,
  Package,
  DollarSign,
  Calendar,
  Camera,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle,
  Shield,
  Wrench,
  Tag,
  Filter,
  Download,
  Upload,
  Loader2,
} from '@/components/ui/custom-icons';
import { Button } from '@cronkwaters/ui';

interface GearItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  notes: string;
  imageUrl?: string;
  insurance: {
    covered: boolean;
    policyNumber?: string;
    insuredValue?: number;
  };
  maintenance: {
    lastService?: string;
    nextService?: string;
    serviceNotes?: string;
  };
}

interface ApiGearItem {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  category: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  condition?: string;
  location?: string;
  notes?: string;
  imageUrl?: string;
  insured?: boolean;
  insurancePolicy?: string;
  insuranceValue?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceNotes?: string;
}

const CATEGORIES = [
  { id: 'guitar', name: 'Guitars', icon: Guitar },
  { id: 'bass', name: 'Bass', icon: Guitar },
  { id: 'keys', name: 'Keyboards', icon: Piano },
  { id: 'drums', name: 'Drums', icon: Music },
  { id: 'mics', name: 'Microphones', icon: Mic },
  { id: 'amps', name: 'Amplifiers', icon: Speaker },
  { id: 'pedals', name: 'Pedals/Effects', icon: Package },
  { id: 'recording', name: 'Recording Gear', icon: Mic },
  { id: 'other', name: 'Other', icon: Package },
];

// Transform API response to component format
function transformApiGear(apiItem: ApiGearItem): GearItem {
  return {
    id: apiItem.id,
    name: apiItem.name,
    brand: apiItem.brand || '',
    model: apiItem.model || '',
    category: apiItem.category,
    serialNumber: apiItem.serialNumber || '',
    purchaseDate: apiItem.purchaseDate || '',
    purchasePrice: apiItem.purchasePrice || 0,
    currentValue: apiItem.currentValue || 0,
    condition: (apiItem.condition as GearItem['condition']) || 'good',
    location: apiItem.location || '',
    notes: apiItem.notes || '',
    imageUrl: apiItem.imageUrl,
    insurance: {
      covered: apiItem.insured || false,
      policyNumber: apiItem.insurancePolicy,
      insuredValue: apiItem.insuranceValue,
    },
    maintenance: {
      lastService: apiItem.lastMaintenanceDate,
      nextService: apiItem.nextMaintenanceDate,
      serviceNotes: apiItem.maintenanceNotes,
    },
  };
}

export function GearInventory() {
  const [gear, setGear] = useState<GearItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GearItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<GearItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch gear from database API
  const fetchGear = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url =
        activeCategory !== 'all' ? `/api/tools/gear?category=${activeCategory}` : '/api/tools/gear';
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401) {
          // Not authenticated - silently use empty state
          setGear([]);
          return;
        }
        throw new Error('Failed to fetch gear');
      }
      const data = await res.json();
      setGear((data.gear || []).map(transformApiGear));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gear');
      setGear([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  // Load gear on mount and category change
  useEffect(() => {
    fetchGear();
  }, [fetchGear]);

  // Filter gear
  const filteredGear = gear.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const totalValue = gear.reduce((sum, item) => sum + item.currentValue, 0);
  const totalInsured = gear
    .filter((item) => item.insurance.covered)
    .reduce((sum, item) => sum + (item.insurance.insuredValue || 0), 0);
  const needsMaintenance = gear.filter((item) => {
    if (!item.maintenance.nextService) return false;
    return new Date(item.maintenance.nextService) <= new Date();
  });

  // Add/Update item via API
  const saveItem = async (item: GearItem) => {
    try {
      setSaving(true);
      const apiPayload = {
        name: item.name,
        brand: item.brand || null,
        model: item.model || null,
        category: item.category,
        serialNumber: item.serialNumber || null,
        purchaseDate: item.purchaseDate || null,
        purchasePrice: item.purchasePrice || null,
        currentValue: item.currentValue || null,
        condition: item.condition,
        location: item.location || null,
        notes: item.notes || null,
        imageUrl: item.imageUrl || null,
        insured: item.insurance.covered,
        insurancePolicy: item.insurance.policyNumber || null,
        insuranceValue: item.insurance.insuredValue || null,
        lastMaintenanceDate: item.maintenance.lastService || null,
        nextMaintenanceDate: item.maintenance.nextService || null,
        maintenanceNotes: item.maintenance.serviceNotes || null,
      };

      if (editingItem) {
        const res = await fetch('/api/tools/gear', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, ...apiPayload }),
        });
        if (!res.ok) throw new Error('Failed to update gear');
        const updated = await res.json();
        setGear(gear.map((g) => (g.id === item.id ? transformApiGear(updated) : g)));
      } else {
        const res = await fetch('/api/tools/gear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload),
        });
        if (!res.ok) throw new Error('Failed to add gear');
        const newItem = await res.json();
        setGear([...gear, transformApiGear(newItem)]);
      }
      setShowAddModal(false);
      setEditingItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Delete item via API
  const deleteItem = async (id: string) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/tools/gear?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete gear');
      setGear(gear.filter((g) => g.id !== id));
      setSelectedItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  // Export inventory
  const exportInventory = () => {
    const csv = [
      [
        'Name',
        'Brand',
        'Model',
        'Category',
        'Serial',
        'Purchase Date',
        'Purchase Price',
        'Current Value',
        'Condition',
        'Location',
        'Insured',
        'Notes',
      ].join(','),
      ...gear.map((item) =>
        [
          `"${item.name}"`,
          `"${item.brand}"`,
          `"${item.model}"`,
          item.category,
          item.serialNumber,
          item.purchaseDate,
          item.purchasePrice,
          item.currentValue,
          item.condition,
          `"${item.location}"`,
          item.insurance.covered ? 'Yes' : 'No',
          `"${item.notes}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gear-inventory.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get condition color
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'text-emerald-400 bg-emerald-400/10';
      case 'good':
        return 'text-blue-400 bg-blue-400/10';
      case 'fair':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'poor':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-muted-foreground bg-white/5';
    }
  };

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.icon || Package;
  };

  return (
    <div className="rnrb-card overflow-hidden rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-slate-500 to-zinc-600">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Gear Inventory</h3>
            <p className="text-muted-foreground text-sm">{gear.length} items tracked</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportInventory} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            className="gap-2 bg-linear-to-r from-slate-500 to-zinc-600"
          >
            <Plus className="h-4 w-4" />
            Add Gear
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 p-4">
          <DollarSign className="mb-2 h-5 w-5 text-emerald-400" />
          <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          <div className="text-muted-foreground text-xs">Total Value</div>
        </div>
        <div className="rounded-xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 p-4">
          <Shield className="mb-2 h-5 w-5 text-blue-400" />
          <div className="text-2xl font-bold">${totalInsured.toLocaleString()}</div>
          <div className="text-muted-foreground text-xs">Insured Value</div>
        </div>
        <div className="rounded-xl bg-linear-to-br from-purple-500/20 to-pink-500/20 p-4">
          <Package className="mb-2 h-5 w-5 text-purple-400" />
          <div className="text-2xl font-bold">{gear.length}</div>
          <div className="text-muted-foreground text-xs">Total Items</div>
        </div>
        <div className="rounded-xl bg-linear-to-br from-orange-500/20 to-red-500/20 p-4">
          <Wrench className="mb-2 h-5 w-5 text-orange-400" />
          <div className="text-2xl font-bold">{needsMaintenance.length}</div>
          <div className="text-muted-foreground text-xs">Need Service</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gear..."
            className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 py-2 pr-4 pl-10 focus:outline-hidden"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              activeCategory === 'all'
                ? 'bg-brand-primary text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            All
          </button>
          {CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                activeCategory === cat.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <cat.icon className="h-3 w-3" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
          <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-red-400" />
          <p className="text-red-400">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={fetchGear}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="rounded-xl bg-white/5 py-12 text-center">
          <Loader2 className="text-muted-foreground mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-muted-foreground">Loading your gear inventory...</p>
        </div>
      ) : filteredGear.length === 0 ? (
        <div className="rounded-xl bg-white/5 py-12 text-center">
          <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground">No gear found. Add your first item!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGear.map((item) => {
            const CategoryIcon = getCategoryIcon(item.category);
            const isOverdue =
              item.maintenance.nextService && new Date(item.maintenance.nextService) <= new Date();

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10"
                onClick={() => setSelectedItem(item)}
              >
                {/* Status badges */}
                <div className="absolute top-3 right-3 flex gap-1">
                  {item.insurance.covered && (
                    <div className="rounded-full bg-blue-500/20 p-1" title="Insured">
                      <Shield className="h-3 w-3 text-blue-400" />
                    </div>
                  )}
                  {isOverdue && (
                    <div className="rounded-full bg-orange-500/20 p-1" title="Service Due">
                      <AlertTriangle className="h-3 w-3 text-orange-400" />
                    </div>
                  )}
                </div>

                {/* Icon */}
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <CategoryIcon className="text-muted-foreground h-6 w-6" />
                </div>

                {/* Info */}
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-muted-foreground text-sm">
                  {item.brand} {item.model}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${getConditionColor(item.condition)}`}
                  >
                    {item.condition}
                  </span>
                  <span className="font-mono text-sm font-semibold text-emerald-400">
                    ${item.currentValue.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedItem.name}</h3>
                  <p className="text-muted-foreground">
                    {selectedItem.brand} {selectedItem.model}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingItem(selectedItem);
                      setShowAddModal(true);
                      setSelectedItem(null);
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteItem(selectedItem.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white/5 p-3">
                    <div className="text-muted-foreground text-xs">Serial Number</div>
                    <div className="font-mono">{selectedItem.serialNumber}</div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <div className="text-muted-foreground text-xs">Condition</div>
                    <div
                      className={`inline-block rounded px-2 py-0.5 ${getConditionColor(selectedItem.condition)}`}
                    >
                      {selectedItem.condition}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <div className="text-muted-foreground text-xs">Purchase Price</div>
                    <div className="font-mono">${selectedItem.purchasePrice.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <div className="text-muted-foreground text-xs">Current Value</div>
                    <div className="font-mono text-emerald-400">
                      ${selectedItem.currentValue.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <div className="text-muted-foreground text-xs">Purchase Date</div>
                    <div>{new Date(selectedItem.purchaseDate).toLocaleDateString()}</div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <div className="text-muted-foreground text-xs">Location</div>
                    <div>{selectedItem.location}</div>
                  </div>
                </div>

                {/* Insurance */}
                <div className="rounded-lg bg-white/5 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Shield className="h-4 w-4" />
                    Insurance
                  </h4>
                  {selectedItem.insurance.covered ? (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Policy #</span>
                        <span>{selectedItem.insurance.policyNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Insured Value</span>
                        <span>${selectedItem.insurance.insuredValue?.toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Not covered</p>
                  )}
                </div>

                {/* Maintenance */}
                <div className="rounded-lg bg-white/5 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Wrench className="h-4 w-4" />
                    Maintenance
                  </h4>
                  <div className="space-y-1 text-sm">
                    {selectedItem.maintenance.lastService && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Service</span>
                        <span>
                          {new Date(selectedItem.maintenance.lastService).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedItem.maintenance.nextService && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Service</span>
                        <span
                          className={
                            new Date(selectedItem.maintenance.nextService) <= new Date()
                              ? 'text-orange-400'
                              : ''
                          }
                        >
                          {new Date(selectedItem.maintenance.nextService).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedItem.maintenance.serviceNotes && (
                      <p className="text-muted-foreground mt-2">
                        {selectedItem.maintenance.serviceNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedItem.notes && (
                  <div className="rounded-lg bg-white/5 p-4">
                    <h4 className="mb-2 text-sm font-semibold">Notes</h4>
                    <p className="text-muted-foreground text-sm">{selectedItem.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => {
              setShowAddModal(false);
              setEditingItem(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-5 text-lg font-bold">
                {editingItem ? 'Edit Gear' : 'Add New Gear'}
              </h3>
              <form
                key={editingItem?.id ?? 'new'}
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const str = (k: string) => ((fd.get(k) as string) ?? '').trim();
                  const num = (k: string) => parseFloat(str(k)) || 0;
                  const optStr = (k: string) => str(k) || undefined;
                  const optNum = (k: string) => {
                    const v = str(k);
                    return v ? parseFloat(v) : undefined;
                  };
                  saveItem({
                    id: editingItem?.id || crypto.randomUUID(),
                    name: str('name'),
                    brand: str('brand'),
                    model: str('model'),
                    category: str('category'),
                    serialNumber: str('serialNumber'),
                    purchaseDate: str('purchaseDate'),
                    purchasePrice: num('purchasePrice'),
                    currentValue: num('currentValue'),
                    condition: (str('condition') as GearItem['condition']) || 'good',
                    location: str('location'),
                    notes: str('notes'),
                    imageUrl: editingItem?.imageUrl,
                    insurance: {
                      covered: fd.has('insuranceCovered'),
                      policyNumber: optStr('policyNumber'),
                      insuredValue: optNum('insuredValue'),
                    },
                    maintenance: {
                      lastService: optStr('lastService'),
                      nextService: optStr('nextService'),
                      serviceNotes: optStr('serviceNotes'),
                    },
                  });
                }}
                className="space-y-5"
              >
                {/* Basic Info */}
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="gear-name"
                      className="text-muted-foreground mb-1 block text-xs font-medium"
                    >
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="gear-name"
                      name="name"
                      type="text"
                      required
                      defaultValue={editingItem?.name ?? ''}
                      placeholder="e.g. Fender Stratocaster"
                      className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 px-3 py-2 text-sm focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="gear-brand"
                        className="text-muted-foreground mb-1 block text-xs font-medium"
                      >
                        Brand
                      </label>
                      <input
                        id="gear-brand"
                        name="brand"
                        type="text"
                        defaultValue={editingItem?.brand ?? ''}
                        placeholder="Fender"
                        className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 px-3 py-2 text-sm focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="gear-model"
                        className="text-muted-foreground mb-1 block text-xs font-medium"
                      >
                        Model
                      </label>
                      <input
                        id="gear-model"
                        name="model"
                        type="text"
                        defaultValue={editingItem?.model ?? ''}
                        placeholder="American Pro II"
                        className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 px-3 py-2 text-sm focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="gear-category"
                        className="text-muted-foreground mb-1 block text-xs font-medium"
                      >
                        Category <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="gear-category"
                        name="category"
                        required
                        defaultValue={editingItem?.category ?? ''}
                        className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 px-3 py-2 text-sm focus:outline-hidden"
                      >
                        <option value="" disabled>
                          Select category
                        </option>
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="gear-condition"
                        className="text-muted-foreground mb-1 block text-xs font-medium"
                      >
                        Condition
                      </label>
                      <select
                        id="gear-condition"
                        name="condition"
                        defaultValue={editingItem?.condition ?? 'good'}
                        className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 px-3 py-2 text-sm focus:outline-hidden"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="border-border/50 grid grid-cols-2 gap-3 border-t pt-4">
                  <div>
                    <label
                      htmlFor="gear-serial"
                      className="text-muted-foreground mb-1 block text-xs font-medium"
                    >
                      Serial Number
                    </label>
                    <input
                      id="gear-serial"
                      name="serialNumber"
                      type="text"
                      defaultValue={editingItem?.serialNumber ?? ''}
                      className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 px-3 py-2 font-mono text-sm focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="gear-location"
                      className="text-muted-foreground mb-1 block text-xs font-medium"
                    >
                      Location
                    </label>
                    <input
                      id="gear-location"
                      name="location"
                      type="text"
                      defaultValue={editingItem?.location ?? ''}
                      placeholder="Studio, Home, etc."
                      className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 px-3 py-2 text-sm focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Financial */}
                <div className="border-border/50 space-y-3 border-t pt-4">
                  <h4 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
                    <DollarSign className="h-4 w-4" />
                    Financial
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="gear-purchase-date"
                        className="text-muted-foreground mb-1 block text-xs font-medium"
                      >
                        Purchase Date
                      </label>
                      <input
                        id="gear-purchase-date"
                        name="purchaseDate"
                        type="date"
                        defaultValue={editingItem?.purchaseDate ?? ''}
                        className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 px-3 py-2 text-sm focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="gear-purchase-price"
                        className="text-muted-foreground mb-1 block text-xs font-medium"
                      >
                        Purchase Price ($)
                      </label>
                      <input
                        id="gear-purchase-price"
                        name="purchasePrice"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={editingItem?.purchasePrice ?? ''}
                        className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 px-3 py-2 font-mono text-sm focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="gear-current-value"
                        className="text-muted-foreground mb-1 block text-xs font-medium"
                      >
                        Current Value ($)
                      </label>
                      <input
                        id="gear-current-value"
                        name="currentValue"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={editingItem?.currentValue ?? ''}
                        className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 px-3 py-2 font-mono text-sm focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance */}
                <div className="border-border/50 space-y-3 border-t pt-4">
                  <h4 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
                    <Shield className="h-4 w-4" />
                    Insurance
                  </h4>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                    <input
                      name="insuranceCovered"
                      type="checkbox"
                      defaultChecked={editingItem?.insurance?.covered ?? false}
                      className="accent-brand-primary h-4 w-4 rounded"
                    />
                    <span className="text-sm">This item is insured</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="gear-policy"
                        className="text-muted-foreground mb-1 block text-xs font-medium"
                      >
                        Policy Number
                      </label>
                      <input
                        id="gear-policy"
                        name="policyNumber"
                        type="text"
                        defaultValue={editingItem?.insurance?.policyNumber ?? ''}
                        className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 px-3 py-2 text-sm focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="gear-insured-value"
                        className="text-muted-foreground mb-1 block text-xs font-medium"
                      >
                        Insured Value ($)
                      </label>
                      <input
                        id="gear-insured-value"
                        name="insuredValue"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={editingItem?.insurance?.insuredValue ?? ''}
                        className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 px-3 py-2 font-mono text-sm focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Maintenance */}
                <div className="border-border/50 space-y-3 border-t pt-4">
                  <h4 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
                    <Wrench className="h-4 w-4" />
                    Maintenance
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="gear-last-service"
                        className="text-muted-foreground mb-1 block text-xs font-medium"
                      >
                        Last Service
                      </label>
                      <input
                        id="gear-last-service"
                        name="lastService"
                        type="date"
                        defaultValue={editingItem?.maintenance?.lastService ?? ''}
                        className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 px-3 py-2 text-sm focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="gear-next-service"
                        className="text-muted-foreground mb-1 block text-xs font-medium"
                      >
                        Next Service
                      </label>
                      <input
                        id="gear-next-service"
                        name="nextService"
                        type="date"
                        defaultValue={editingItem?.maintenance?.nextService ?? ''}
                        className="border-border focus:border-brand-primary w-full rounded-xl border bg-white/5 px-3 py-2 text-sm focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="gear-service-notes"
                      className="text-muted-foreground mb-1 block text-xs font-medium"
                    >
                      Service Notes
                    </label>
                    <textarea
                      id="gear-service-notes"
                      name="serviceNotes"
                      rows={2}
                      defaultValue={editingItem?.maintenance?.serviceNotes ?? ''}
                      placeholder="Any maintenance notes..."
                      className="border-border focus:border-brand-primary w-full resize-none rounded-xl border bg-white/5 px-3 py-2 text-sm focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="border-border/50 border-t pt-4">
                  <label
                    htmlFor="gear-notes"
                    className="text-muted-foreground mb-1 block text-xs font-medium"
                  >
                    Notes
                  </label>
                  <textarea
                    id="gear-notes"
                    name="notes"
                    rows={3}
                    defaultValue={editingItem?.notes ?? ''}
                    placeholder="Additional notes about this item..."
                    className="border-border focus:border-brand-primary w-full resize-none rounded-xl border bg-white/5 px-3 py-2 text-sm focus:outline-hidden"
                  />
                </div>

                {/* Actions */}
                <div className="border-border/50 flex justify-end gap-2 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingItem(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="gap-2">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saving ? 'Saving...' : editingItem ? 'Update Gear' : 'Add Gear'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
