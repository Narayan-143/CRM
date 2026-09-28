import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getContacts } from '../api/contacts';
import { getDeals } from '../api/deals';
import {
  Users,
  KanbanSquare,
  Trophy,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Building,
  Mail,
} from 'lucide-react';
import ContactModal from '../components/ContactModal';
import DealModal from '../components/DealModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [dealModalOpen, setDealModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contactsRes, dealsRes] = await Promise.all([
        getContacts(),
        getDeals(),
      ]);

      if (contactsRes.success) setContacts(contactsRes.data);
      if (dealsRes.success) setDeals(dealsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalContacts = contacts.length;
  const totalDeals = deals.length;
  const wonDeals = deals.filter((d) => d.stage === 'Won').length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, {user?.name}! Here is your sales pipeline overview.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setContactModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Add Contact</span>
          </button>
          <button
            onClick={() => setDealModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Deal</span>
          </button>
        </div>
      </div>

      {/* Required Dashboard KPI Metrics: Total Contacts, Total Deals, Won Deals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Total Contacts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Contacts
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : totalContacts}
            </h2>
            <Link
              to="/contacts"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-3 group"
            >
              <span>View all contacts</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Metric 2: Total Deals */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Deals
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <KanbanSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : totalDeals}
            </h2>
            <Link
              to="/deals"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 mt-3 group"
            >
              <span>Open deals pipeline</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Metric 3: Won Deals */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Won Deals
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : wonDeals}
            </h2>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Successfully closed opportunities</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Overview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contacts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base">
              Recent Contacts
            </h3>
            <Link
              to="/contacts"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              See all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {contacts.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No contacts added yet. Click "+ Add Contact" to get started.
              </div>
            ) : (
              contacts.slice(0, 5).map((contact) => (
                <Link
                  key={contact._id}
                  to={`/contacts/${contact._id}`}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors group block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {contact.name}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        {contact.company && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {contact.company}
                          </span>
                        )}
                        {contact.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Deals */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base">
              Recent Deals
            </h3>
            <Link
              to="/deals"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Open Pipeline
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {deals.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No deals created yet. Click "+ New Deal" to create your first deal.
              </div>
            ) : (
              deals.slice(0, 5).map((deal) => {
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
                    className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {deal.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {deal.contactId?.name ? (
                          <span>With {deal.contactId.name}</span>
                        ) : (
                          <span>No contact linked</span>
                        )}
                        <span className="mx-1.5">•</span>
                        <span className="font-medium text-slate-700">
                          ${deal.value.toLocaleString()}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        stageColors[deal.stage] || stageColors.New
                      }`}
                    >
                      {deal.stage}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onSuccess={loadData}
      />
      <DealModal
        isOpen={dealModalOpen}
        onClose={() => setDealModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

export default Dashboard;
