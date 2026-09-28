import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getContacts, deleteContact } from '../api/contacts';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  X,
} from 'lucide-react';
import ContactModal from '../components/ContactModal';
import AIEmailModal from '../components/AIEmailModal';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // AI Email Modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiData, setAiData] = useState(null);

  const fetchContacts = async (searchTerm = '') => {
    try {
      setLoading(true);
      const res = await getContacts(searchTerm);
      if (res.success) {
        setContacts(res.data);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete contact "${name}"?`)) {
      try {
        const res = await deleteContact(id);
        if (res.success) {
          fetchContacts(search);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete contact');
      }
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleOpenAiEmail = (contact) => {
    setAiData({
      contactName: contact.name,
      company: contact.company,
      notes: contact.notes,
      dealTitle: '',
      dealStage: '',
      dealValue: '',
    });
    setAiModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600" />
            <span>Contacts</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your leads, prospects, and business clients
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search contacts by name, email, phone, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contacts List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading contacts...
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              {search ? 'No matching contacts found' : 'No contacts yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {search
                ? `No results for "${search}". Try searching by another keyword.`
                : 'Get started by creating your first contact in the CRM.'}
            </p>
            {!search && (
              <button
                onClick={handleCreate}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Name</th>
                  <th className="py-3.5 px-4 sm:px-6">Company</th>
                  <th className="py-3.5 px-4 sm:px-6">Contact Info</th>
                  <th className="py-3.5 px-4 sm:px-6">Notes</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {contacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Name */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm flex items-center justify-center flex-shrink-0 border border-indigo-100">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            to={`/contacts/${contact._id}`}
                            className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1"
                          >
                            <span>{contact.name}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <span className="text-xs text-slate-400">
                            Added {new Date(contact.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-4 sm:px-6 text-slate-700">
                      {contact.company ? (
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{contact.company}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">—</span>
                      )}
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-4 sm:px-6 text-slate-600">
                      <div className="space-y-1">
                        {contact.email && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <a
                              href={`mailto:${contact.email}`}
                              className="hover:text-indigo-600"
                            >
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {!contact.email && !contact.phone && (
                          <span className="text-slate-400 text-xs italic">—</span>
                        )}
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="py-4 px-4 sm:px-6 text-slate-500 text-xs max-w-xs truncate">
                      {contact.notes || (
                        <span className="italic text-slate-400">No notes</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* AI Follow-up Email */}
                        <button
                          onClick={() => handleOpenAiEmail(contact)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-medium border border-indigo-200/60 transition-colors"
                          title="Generate AI Follow-up Email"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="hidden sm:inline">AI Email</span>
                        </button>

                        {/* View Details */}
                        <Link
                          to={`/contacts/${contact._id}`}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Edit */}
                        <button
                          onClick={() => handleEdit(contact)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Contact"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(contact._id, contact.name)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contact={editingContact}
        onSuccess={() => fetchContacts(search)}
      />

      <AIEmailModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        data={aiData}
      />
    </div>
  );
};

export default Contacts;
