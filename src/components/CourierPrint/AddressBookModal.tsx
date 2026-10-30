import React, { useState, useEffect } from 'react';
import { CourierAddress } from '../../types/courierPrint';
import { toUpperClean, DEFAULT_SENDER } from '../../utils/indianPostalData';
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileDown,
  Upload,
  Star,
  MapPin,
  Building,
  Phone,
} from 'lucide-react';

interface AddressBookModalProps {
  onSelectAddress: (addr: CourierAddress, asType: 'TO' | 'FROM') => void;
  onClose: () => void;
}

const STORAGE_KEY = 'courierprint_address_book_v1';

export const AddressBookModal: React.FC<AddressBookModalProps> = ({
  onSelectAddress,
  onClose,
}) => {
  const [addresses, setAddresses] = useState<CourierAddress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAddr, setEditingAddr] = useState<CourierAddress | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAddresses(JSON.parse(stored));
      } else {
        const initial = [
          DEFAULT_SENDER,
          {
            id: 'addr-sample-1',
            name: 'RAJESH KUMAR SHARMA',
            company: 'SHARMA TRADING CORPORATION',
            addressLine1: 'FLAT NO. 302, SAI KRIPA APARTMENTS',
            addressLine2: '7TH CROSS, INDIRANAGAR 1ST STAGE',
            landmark: 'NEAR CMH HOSPITAL',
            city: 'BENGALURU',
            state: 'KARNATAKA',
            pinCode: '560037',
            mobile: '9845098765',
            category: 'CUSTOMER' as const,
          },
          {
            id: 'addr-sample-2',
            name: 'VIKAS ELECTRONICS & SPARES',
            company: 'VIKAS ENTERPRISES',
            addressLine1: 'SHOP 12, NEHRU PLACE MARKET',
            addressLine2: 'MAIN ROAD',
            landmark: 'OPP. METRO PILLAR 42',
            city: 'NEW DELHI',
            state: 'DELHI',
            pinCode: '110019',
            mobile: '9811099887',
            category: 'VENDOR' as const,
          },
        ];
        setAddresses(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch {
      // Fallback
    }
  }, []);

  const saveAddresses = (updated: CourierAddress[]) => {
    setAddresses(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  };

  const handleSaveEdit = (addr: CourierAddress) => {
    let updated: CourierAddress[];
    if (addresses.some((a) => a.id === addr.id)) {
      updated = addresses.map((a) => (a.id === addr.id ? addr : a));
    } else {
      updated = [addr, ...addresses];
    }
    saveAddresses(updated);
    setEditingAddr(null);
    setIsAddingNew(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this address?')) {
      const updated = addresses.filter((a) => a.id !== id);
      saveAddresses(updated);
    }
  };

  const handleSetDefaultSender = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefaultSender: a.id === id,
    }));
    saveAddresses(updated);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['NAME', 'COMPANY', 'ADDRESS_LINE1', 'ADDRESS_LINE2', 'LANDMARK', 'CITY', 'STATE', 'PIN_CODE', 'MOBILE', 'CATEGORY'];
    const rows = addresses.map((a) => [
      `"${a.name || ''}"`,
      `"${a.company || ''}"`,
      `"${a.addressLine1 || ''}"`,
      `"${a.addressLine2 || ''}"`,
      `"${a.landmark || ''}"`,
      `"${a.city || ''}"`,
      `"${a.state || ''}"`,
      `"${a.pinCode || ''}"`,
      `"${a.mobile || ''}"`,
      `"${a.category || 'CUSTOMER'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CourierPrint_AddressBook_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length <= 1) return;

      const imported: CourierAddress[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts[0]) {
          imported.push({
            id: `imported-${Date.now()}-${i}`,
            name: toUpperClean(parts[0]),
            company: toUpperClean(parts[1]),
            addressLine1: toUpperClean(parts[2] || 'ADDRESS'),
            addressLine2: toUpperClean(parts[3]),
            landmark: toUpperClean(parts[4]),
            city: toUpperClean(parts[5] || 'CITY'),
            state: toUpperClean(parts[6] || 'STATE'),
            pinCode: parts[7] || '000000',
            mobile: parts[8] || '',
            category: (parts[9] as any) || 'CUSTOMER',
          });
        }
      }

      if (imported.length > 0) {
        const merged = [...imported, ...addresses];
        saveAddresses(merged);
        alert(`✅ Imported ${imported.length} addresses successfully!`);
      }
    };
    reader.readAsText(file);
  };

  const filtered = addresses.filter((a) => {
    const q = searchQuery.toUpperCase();
    const matchesSearch =
      a.name.toUpperCase().includes(q) ||
      (a.company && a.company.toUpperCase().includes(q)) ||
      a.city.toUpperCase().includes(q) ||
      a.state.toUpperCase().includes(q) ||
      a.pinCode.includes(q) ||
      (a.mobile && a.mobile.includes(q));

    const matchesCategory = filterCategory === 'ALL' || a.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 text-slate-900 dark:text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Saved Address Book</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {addresses.length} saved dispatch records • Fast 1-click loading into TO or FROM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <label className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
            </label>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, city, PIN, or mobile..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            >
              <option value="ALL">All Categories</option>
              <option value="CUSTOMER">Customers</option>
              <option value="VENDOR">Vendors</option>
              <option value="BRANCH">Branches</option>
              <option value="PERSONAL">Personal</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setEditingAddr({
                  id: `addr-${Date.now()}`,
                  name: '',
                  company: '',
                  addressLine1: '',
                  addressLine2: '',
                  landmark: '',
                  city: '',
                  state: '',
                  pinCode: '',
                  mobile: '',
                  category: 'CUSTOMER',
                });
                setIsAddingNew(true);
              }}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Address</span>
            </button>
          </div>
        </div>

        {/* Address List or Edit Form */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {editingAddr ? (
            <div className="border border-blue-300 dark:border-blue-700 rounded-lg p-4 bg-blue-50/20 dark:bg-blue-950/20 space-y-3">
              <div className="font-bold text-xs text-blue-900 dark:text-blue-300">
                {isAddingNew ? 'Add New Address Record' : 'Edit Address Record'}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-0.5">FULL NAME *</label>
                  <input
                    type="text"
                    value={editingAddr.name}
                    onChange={(e) => setEditingAddr({ ...editingAddr, name: toUpperClean(e.target.value) })}
                    className="w-full uppercase text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-0.5">COMPANY</label>
                  <input
                    type="text"
                    value={editingAddr.company || ''}
                    onChange={(e) => setEditingAddr({ ...editingAddr, company: toUpperClean(e.target.value) })}
                    className="w-full uppercase text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-0.5">ADDRESS LINE 1 *</label>
                <input
                  type="text"
                  value={editingAddr.addressLine1}
                  onChange={(e) => setEditingAddr({ ...editingAddr, addressLine1: toUpperClean(e.target.value) })}
                  className="w-full uppercase text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-0.5">ADDRESS LINE 2</label>
                  <input
                    type="text"
                    value={editingAddr.addressLine2 || ''}
                    onChange={(e) => setEditingAddr({ ...editingAddr, addressLine2: toUpperClean(e.target.value) })}
                    className="w-full uppercase text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-0.5">LANDMARK</label>
                  <input
                    type="text"
                    value={editingAddr.landmark || ''}
                    onChange={(e) => setEditingAddr({ ...editingAddr, landmark: toUpperClean(e.target.value) })}
                    className="w-full uppercase text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-0.5">CITY *</label>
                  <input
                    type="text"
                    value={editingAddr.city}
                    onChange={(e) => setEditingAddr({ ...editingAddr, city: toUpperClean(e.target.value) })}
                    className="w-full uppercase text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-0.5">PIN CODE *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editingAddr.pinCode}
                    onChange={(e) => setEditingAddr({ ...editingAddr, pinCode: e.target.value.replace(/\D/g, '') })}
                    className="w-full font-mono text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-0.5">STATE *</label>
                  <input
                    type="text"
                    value={editingAddr.state}
                    onChange={(e) => setEditingAddr({ ...editingAddr, state: toUpperClean(e.target.value) })}
                    className="w-full uppercase text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-0.5">MOBILE NUMBER</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editingAddr.mobile || ''}
                    onChange={(e) => setEditingAddr({ ...editingAddr, mobile: e.target.value.replace(/\D/g, '') })}
                    className="w-full font-mono text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-0.5">CATEGORY</label>
                  <select
                    value={editingAddr.category || 'CUSTOMER'}
                    onChange={(e) => setEditingAddr({ ...editingAddr, category: e.target.value as any })}
                    className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="BRANCH">Branch</option>
                    <option value="PERSONAL">Personal</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddr(null);
                    setIsAddingNew(false);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(editingAddr)}
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-md shadow-xs cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No matching addresses found in address book.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-slate-850 hover:border-blue-400 dark:hover:border-blue-700 transition-colors flex flex-wrap items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1 max-w-[65%]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-950 dark:text-slate-100 uppercase">
                      {item.name}
                    </span>
                    {item.isDefaultSender && (
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>Default Sender</span>
                      </span>
                    )}
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-mono uppercase">
                      {item.category || 'CUSTOMER'}
                    </span>
                  </div>

                  {item.company && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 uppercase font-medium">
                      {item.company}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase">
                    {[item.addressLine1, item.addressLine2, item.landmark].filter(Boolean).join(', ')}
                  </div>

                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase font-mono">
                    {item.city}, {item.state} - {item.pinCode}
                    {item.mobile && <span className="ml-2 font-normal text-slate-600 dark:text-slate-400">| MOB: {item.mobile}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectAddress(item, 'TO');
                      onClose();
                    }}
                    className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded border border-blue-200 dark:border-blue-800 cursor-pointer"
                  >
                    Set as TO
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectAddress(item, 'FROM');
                      onClose();
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded cursor-pointer"
                  >
                    Set as FROM
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetDefaultSender(item.id)}
                    title="Set as Default Sender"
                    className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                      item.isDefaultSender
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                        : 'text-slate-400 hover:text-amber-500'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${item.isDefaultSender ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddr(item);
                      setIsAddingNew(false);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
