import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getContactById, deleteContact } from '../api/contacts';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  FileText,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  Plus,
  DollarSign,
  KanbanSquare,
} from 'lucide-react';
import ContactModal from '../components/ContactModal';
import DealModal from '../components/DealModal';
import AIEmailModal from '../components/AIEmailModal';

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedDealForAi, setSelectedDealForAi] = useState(null);

  const fetchContact = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getContactById(id);
      if (res.success) {
        setContact(res.data);
      } else {
        setError('Contact not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading contact');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${contact?.name}?`)) {
      try {
        await deleteContact(id);
        navigate('/contacts');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete contact');
      }
    }
  };

  const handleOpenAiModal = (deal = null) => {
    setSelectedDealForAi(deal);
    setIsAiModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm">
        Loading contact details...
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">
          {error || 'Contact not found'}
        </h2>
        <Link
          to="/contacts"
          className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-medium text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contacts</span>
        </Link>
      </div>
    );
  }

  const primaryDeal = contact.deals && contact.deals.length > 0 ? contact.deals[0] : null;

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/contacts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Contacts</span>
        </Link>

        {/* Contact Banner Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {contact.name}
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                {contact.company && (
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    {contact.company}
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  Added on {new Date(contact.createdAt).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Generate Follow-up Email Button (Requested Feature) */}
            <button
              onClick={() => handleOpenAiModal(primaryDeal)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Generate Follow-up Email</span>
            </button>

            <button
              onClick={() => setIsEditContactOpen(true)}
              className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              title="Edit Contact"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleDelete}
              className="p-2 border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl transition-colors"
              title="Delete Contact"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Contact Information
            </h2>

            <div className="space-y-3.5 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  Email
                </span>
                {contact.email ? (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-indigo-600 hover:underline font-medium"
                  >
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{contact.email}</span>
                  </a>
                ) : (
                  <span className="text-slate-400 italic text-xs">Not provided</span>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  Phone
                </span>
                {contact.phone ? (
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{contact.phone}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-xs">Not provided</span>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  Company
                </span>
                {contact.company ? (
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span>{contact.company}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-xs">Not provided</span>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  Notes
                </span>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-xs leading-relaxed border border-slate-100">
                  {contact.notes || 'No notes available for this contact.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Associated Deals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KanbanSquare className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-800 text-base">
                  Deals with {contact.name}
                </h2>
              </div>
              <button
                onClick={() => setIsNewDealOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Deal</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {!contact.deals || contact.deals.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500">
                    No active deals associated with this contact yet.
                  </p>
                  <button
                    onClick={() => setIsNewDealOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create a Deal</span>
                  </button>
                </div>
              ) : (
                contact.deals.map((deal) => {
                  const stageColors = {
                    New: 'bg-slate-100 text-slate-700 border-slate-200',
                    Contacted: 'bg-blue-50 text-blue-700 border-blue-200',
                    Qualified: 'bg-amber-50 text-amber-700 border-amber-200',
                    Won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Lost: 'bg-rose-50 text-rose-700 border-rose-200',
                  };

                  return (
                    <div
                      key={deal._id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {deal.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                          <span className="font-semibold text-slate-700">
                            ${deal.value?.toLocaleString()}
                          </span>
                          {deal.notes && <span>• {deal.notes}</span>}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            stageColors[deal.stage] || stageColors.New
                          }`}
                        >
                          {deal.stage}
                        </span>

                        <button
                          onClick={() => handleOpenAiModal(deal)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Generate AI Follow-up for this deal"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ContactModal
        isOpen={isEditContactOpen}
        onClose={() => setIsEditContactOpen(false)}
        contact={contact}
        onSuccess={fetchContact}
      />

      <DealModal
        isOpen={isNewDealOpen}
        onClose={() => setIsNewDealOpen(false)}
        defaultContactId={contact._id}
        onSuccess={fetchContact}
      />

      <AIEmailModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        data={{
          contactName: contact.name,
          company: contact.company,
          notes: contact.notes,
          dealTitle: selectedDealForAi?.title || '',
          dealStage: selectedDealForAi?.stage || '',
          dealValue: selectedDealForAi?.value !== undefined ? selectedDealForAi.value : '',
        }}
      />
    </div>
  );
};

export default ContactDetail;
