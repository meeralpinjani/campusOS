import React, { useState, useRef } from 'react';
import {
  X,
  Tag,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Plus,
  Loader2,
} from 'lucide-react';
import { createMarketplaceListing } from '../services/api';

const CATEGORIES = [
  'Textbooks & Notes',
  'Electronics & Gadgets',
  'Drawing & Drafting Tools',
  'Lab Equipment',
  'Hostel Essentials',
  'Vehicles & Cycles',
  'Other',
];

const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair', 'Used'];
const CONTACT_PREFS = ['In-App DM', 'Phone Call', 'WhatsApp', 'Email'];

const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  category: 'Textbooks & Notes',
  condition: 'Good',
  price: '',
  originalPurchaseDate: '',
  sellerContactPreference: 'In-App DM',
  contactDetail: '',
};

/**
 * Client-side image compressor:
 * Resizes large camera photos to a max of 1200x1200px and exports as clean JPEG,
 * ensuring fast loading and adhering to backend limits.
 */
const compressImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

export const CreateListingModal = ({ isOpen, onClose, onListingCreated }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [images, setImages] = useState([]);
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' | 'link'
  const [linkInput, setLinkInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM_STATE);
    setImages([]);
    setLinkInput('');
    setError('');
    setIsProcessing(false);
    onClose();
  };

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;
    setError('');

    const maxAllowed = 5 - images.length;
    if (maxAllowed <= 0) {
      setError('Maximum 5 images allowed per listing.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, maxAllowed);
    setIsProcessing(true);

    try {
      const compressedList = [];
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) {
          continue;
        }
        const compressed = await compressImageFile(file);
        compressedList.push(compressed);
      }

      if (compressedList.length === 0) {
        setError('Please select valid image files (JPG, PNG, WEBP).');
      } else {
        setImages((prev) => [...prev, ...compressedList]);
      }
    } catch (err) {
      console.error('Error processing images:', err);
      setError('Failed to process image. Please try another file.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e) => {
    processFiles(e.target.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleAddLink = (e) => {
    if (e) e.preventDefault();
    if (!linkInput.trim()) return;

    if (images.length >= 5) {
      setError('Maximum 5 images allowed per listing.');
      return;
    }

    const url = linkInput.trim();
    if (!/^https?:\/\//i.test(url)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setImages((prev) => [...prev, url]);
    setLinkInput('');
    setError('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.price) {
      setError('Please fill in required fields (title, description, price)');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await createMarketplaceListing({
        ...formData,
        price: parseFloat(formData.price),
        images,
      });

      if (onListingCreated) onListingCreated(res.listing);
      handleClose();
    } catch (err) {
      console.error('Create listing error:', err);
      setError(err.message || 'Failed to publish listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C43E3E] text-white flex items-center justify-center shadow-xs">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-none">
                Post Marketplace Item
              </h3>
              <p className="text-[10px] font-bold text-[#C43E3E] uppercase tracking-wider mt-0.5">
                Campus Student Marketplace Listing
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Item Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Engineering Mathematics Vol II Textbook (8th Ed)"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C43E3E]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C43E3E]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C43E3E]"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="450"
                min="0"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C43E3E]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Original Purchase Date (Optional)
              </label>
              <input
                type="text"
                name="originalPurchaseDate"
                value={formData.originalPurchaseDate}
                onChange={handleChange}
                placeholder="e.g. Aug 2024 or 6 months ago"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C43E3E]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description & Item Details *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe condition, missing parts, included accessories, or pickup location on campus..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C43E3E] resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Preference
              </label>
              <select
                name="sellerContactPreference"
                value={formData.sellerContactPreference}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C43E3E]"
              >
                {CONTACT_PREFS.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Number / Note (Optional)
              </label>
              <input
                type="text"
                name="contactDetail"
                value={formData.contactDetail}
                onChange={handleChange}
                placeholder="e.g. Hosteller Room 304 or +91 98xxxx"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C43E3E]"
              />
            </div>
          </div>

          {/* Item Photos Section with Upload and Link Options */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Item Photos <span className="text-slate-400 font-normal">({images.length}/5)</span>
              </label>

              {/* Mode Toggle: Upload File vs Image Link */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setImageInputMode('upload');
                    setError('');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    imageInputMode === 'upload'
                      ? 'bg-white dark:bg-slate-900 text-[#C43E3E] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageInputMode('link');
                    setError('');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    imageInputMode === 'link'
                      ? 'bg-white dark:bg-slate-900 text-[#C43E3E] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>Image Link</span>
                </button>
              </div>
            </div>

            {/* Upload Area */}
            {imageInputMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  multiple
                  className="hidden"
                />
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isDragging
                      ? 'border-[#C43E3E] bg-red-50/50 dark:bg-red-950/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-[#C43E3E]/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-700 shadow-2xs flex items-center justify-center text-[#C43E3E]">
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {isProcessing
                      ? 'Processing & optimizing photo...'
                      : 'Click to upload image or drag & drop'}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    JPG, PNG, WEBP from your computer or phone (up to 5 photos)
                  </p>
                </div>
              </div>
            ) : (
              /* Image Link URL Area */
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddLink();
                        }
                      }}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C43E3E] font-mono text-[11px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLink}
                    disabled={!linkInput.trim() || images.length >= 5}
                    className="px-3.5 py-2 bg-[#C43E3E] hover:bg-[#A63333] disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Link</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Paste a direct web link to an image and click Add Link.
                </p>
              </div>
            )}

            {/* Thumbnail Previews */}
            {images.length > 0 && (
              <div className="pt-2">
                <div className="grid grid-cols-5 gap-2">
                  {images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs"
                    >
                      <img
                        src={imgUrl}
                        alt={`Listing preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/75 text-[8px] font-black text-white uppercase tracking-wider rounded-md backdrop-blur-xs">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-85 hover:opacity-100 hover:scale-110 shadow-xs cursor-pointer transition-all"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-[#FAFAFA] dark:hover:bg-[#111214] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isProcessing}
              className="px-5 py-2 bg-[#C43E3E] hover:bg-[#A63333] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              {loading ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
