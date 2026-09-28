import { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { generateFollowUpEmail } from '../api/ai';

const AIEmailModal = ({ isOpen, onClose, data }) => {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && data) {
      handleGenerate();
    } else {
      setSubject('');
      setBody('');
      setError('');
      setCopied(false);
    }
  }, [isOpen, data]);

  const handleGenerate = async () => {
    if (!data) return;

    setLoading(true);
    setError('');
    setCopied(false);

    try {
      const response = await generateFollowUpEmail({
        contactName: data.contactName || '',
        company: data.company || '',
        notes: data.notes || '',
        dealTitle: data.dealTitle || '',
        dealStage: data.dealStage || '',
        dealValue: data.dealValue !== undefined ? data.dealValue : '',
      });

      if (response.success && response.data) {
        setSubject(response.data.subject || '');
        setBody(response.data.body || '');
      } else {
        setError(response.message || 'Could not generate email draft.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to connect to AI service. Ensure AI_API_KEY is configured in server/.env';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all border border-indigo-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4 text-indigo-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                AI Follow-up Email Generator
              </h2>
              <p className="text-xs text-slate-500">
                Draft for {data?.contactName || data?.dealTitle || 'Client'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">AI Notice</p>
                <p className="text-xs mt-0.5 text-amber-700">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-medium text-slate-600">
                Generating personalized follow-up email draft...
              </p>
              <p className="text-xs text-slate-400">
                Analyzing contact notes, company, and deal context
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line will appear here..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Body
                </label>
                <textarea
                  rows="8"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Email body draft will appear here..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all leading-relaxed text-slate-700"
                ></textarea>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex items-center justify-between">
                <span>
                  💡 <strong>Note:</strong> Emails are never sent automatically.
                  This is only a draft.
                </span>
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={loading || !body}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Draft</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEmailModal;
