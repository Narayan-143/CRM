import { useState, useEffect } from 'react';
import { getDeals, updateDealStage, deleteDeal } from '../api/deals';
import {
  KanbanSquare,
  Plus,
  DollarSign,
  User,
  Sparkles,
  Edit2,
  Trash2,
  GripVertical,
  Building,
} from 'lucide-react';
import DealModal from '../components/DealModal';
import AIEmailModal from '../components/AIEmailModal';

const STAGES = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];

const STAGE_CONFIG = {
  New: {
    color: 'border-t-slate-400 bg-slate-50/50',
    badge: 'bg-slate-100 text-slate-700',
  },
  Contacted: {
    color: 'border-t-blue-500 bg-blue-50/20',
    badge: 'bg-blue-50 text-blue-700',
  },
  Qualified: {
    color: 'border-t-amber-500 bg-amber-50/20',
    badge: 'bg-amber-50 text-amber-700',
  },
  Won: {
    color: 'border-t-emerald-500 bg-emerald-50/20',
    badge: 'bg-emerald-50 text-emerald-700',
  },
  Lost: {
    color: 'border-t-rose-400 bg-rose-50/20',
    badge: 'bg-rose-50 text-rose-700',
  },
};

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedDealId, setDraggedDealId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Modals state
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  // AI Email Modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiData, setAiData] = useState(null);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await getDeals();
      if (res.success) {
        setDeals(res.data);
      }
    } catch (err) {
      console.error('Failed to load deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, dealId) => {
    setDraggedDealId(dealId);
    e.dataTransfer.setData('text/plain', dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    setDragOverStage(null);

    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
    setDraggedDealId(null);

    if (!dealId) return;

    const currentDeal = deals.find((d) => d._id === dealId);
    if (!currentDeal || currentDeal.stage === targetStage) return;

    // Optimistic UI update
    const previousDeals = [...deals];
    setDeals((prev) =>
      prev.map((deal) =>
        deal._id === dealId ? { ...deal, stage: targetStage } : deal
      )
    );

    try {
      await updateDealStage(dealId, targetStage);
    } catch (err) {
      // Revert upon error
      setDeals(previousDeals);
      alert(err.response?.data?.message || 'Failed to update deal stage');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete deal "${title}"?`)) {
      try {
        await deleteDeal(id);
        setDeals((prev) => prev.filter((d) => d._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete deal');
      }
    }
  };

  const handleOpenAiModal = (deal) => {
    setAiData({
      contactName: deal.contactId?.name || '',
      company: deal.contactId?.company || '',
      notes: deal.notes || deal.contactId?.notes || '',
      dealTitle: deal.title || '',
      dealStage: deal.stage || '',
      dealValue: deal.value !== undefined ? deal.value : '',
    });
    setAiModalOpen(true);
  };

  const totalValue = deals.reduce((acc, d) => acc + (d.value || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <KanbanSquare className="w-7 h-7 text-indigo-600" />
            <span>Deals Pipeline</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Drag and drop deals across stages to advance your pipeline. Total: $
            {totalValue.toLocaleString()}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDeal(null);
            setDealModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Deal</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      {loading ? (
        <div className="py-24 text-center text-sm text-slate-500">
          Loading deals pipeline...
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 items-start min-h-[600px]">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            const isTarget = dragOverStage === stage;
            const config = STAGE_CONFIG[stage] || STAGE_CONFIG.New;

            return (
              <div
                key={stage}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
                className={`w-72 sm:w-80 flex-shrink-0 bg-slate-100/80 rounded-2xl p-3 border-t-4 transition-all duration-150 flex flex-col max-h-[80vh] ${
                  config.color
                } ${
                  isTarget
                    ? 'ring-2 ring-indigo-500 bg-indigo-50/40 shadow-md scale-[1.01]'
                    : 'border-slate-200'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">
                      {stage}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}
                    >
                      {stageDeals.length}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    ${stageValue.toLocaleString()}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto px-1 py-1">
                  {stageDeals.length === 0 ? (
                    <div
                      className={`border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400 ${
                        isTarget ? 'border-indigo-400 bg-indigo-50/50' : ''
                      }`}
                    >
                      Drop deals here
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const isDragging = draggedDealId === deal._id;

                      return (
                        <div
                          key={deal._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal._id)}
                          className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:shadow-md cursor-grab active:cursor-grabbing transition-all select-none group relative ${
                            isDragging
                              ? 'opacity-40 scale-95 border-indigo-300'
                              : 'hover:border-slate-300'
                          }`}
                        >
                          {/* Drag Handle Icon Indicator */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm text-slate-900 leading-snug line-clamp-2">
                              {deal.title}
                            </h3>
                            <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0 group-hover:text-slate-400" />
                          </div>

                          {/* Contact Name & Value */}
                          <div className="mt-2.5 space-y-1">
                            {deal.contactId?.name ? (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate">
                                  {deal.contactId.name}
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-400 italic">
                                No contact linked
                              </div>
                            )}

                            <div className="flex items-center gap-1 text-sm font-bold text-slate-800 pt-1">
                              <span>${deal.value?.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <button
                              onClick={() => handleOpenAiModal(deal)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                              title="Generate AI Follow-up Email for this deal"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-500" />
                              <span>AI Email</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingDeal(deal);
                                  setDealModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                                title="Edit Deal"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(deal._id, deal.title)
                                }
                                className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                title="Delete Deal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <DealModal
        isOpen={dealModalOpen}
        onClose={() => setDealModalOpen(false)}
        deal={editingDeal}
        onSuccess={fetchDeals}
      />

      <AIEmailModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        data={aiData}
      />
    </div>
  );
};

export default Deals;
