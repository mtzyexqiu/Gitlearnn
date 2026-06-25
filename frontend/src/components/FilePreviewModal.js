import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import mammoth from 'mammoth/mammoth.browser';

const FilePreviewModal = ({ open, file, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!open || !file) return;
    let cancelled = false;
    let objUrl = null;
    const fetchBlob = async () => {
      setLoading(true);
      setContentType('');
      setImageSrc(null);
      setTextContent('');
      try {
        const url = file.fileUrl.startsWith('http') ? file.fileUrl : `${API.defaults.baseURL.replace(/\/api$/, '')}${file.fileUrl}`;
        const res = await API.get(url, { responseType: 'blob' });
        const blob = res.data;
        const type = blob.type || res.headers['content-type'] || '';
        if (cancelled) return;
        setContentType(type);
        if (type.startsWith('image/')) {
          objUrl = URL.createObjectURL(blob);
          setImageSrc(objUrl);
          setBlobUrl(objUrl);
        } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || (file.fileName && file.fileName.toLowerCase().endsWith('.docx'))) {
          // handle .docx: convert to text using mammoth in browser
          try {
            const arrayBuffer = await blob.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            // convert HTML to plain text to prevent selection copying
            const tmp = document.createElement('div');
            tmp.innerHTML = result.value || '';
            const plain = tmp.innerText || tmp.textContent || '';
            setTextContent(plain);
          } catch (e) {
            console.error('mammoth error', e);
            setTextContent('Preview tidak tersedia untuk tipe file ini.');
          }
          objUrl = URL.createObjectURL(blob);
          setBlobUrl(objUrl);
        } else {
          // try read as text
          try {
            const txt = await blob.text();
            setTextContent(txt);
          } catch (e) {
            setTextContent('Preview tidak tersedia untuk tipe file ini.');
          }
          objUrl = URL.createObjectURL(blob);
          setBlobUrl(objUrl);
        }
      } catch (err) {
        console.error(err);
        setTextContent('Gagal memuat preview file.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBlob();
    return () => {
      cancelled = true;
      if (objUrl) URL.revokeObjectURL(objUrl);
      setImageSrc(null);
      setTextContent('');
      setBlobUrl(null);
    };
  }, [open, file]);

  if (!open || !file) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-70 w-full max-w-4xl mx-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 overflow-hidden" style={{maxHeight: '90vh'}}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-bold text-white">Preview: {file.fileName}</p>
              <p className="text-gray-400 text-xs">{contentType}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="text-gray-400 hover:text-white">Tutup</button>
            </div>
          </div>

          <div className="relative bg-black rounded-xl p-4 text-white" style={{minHeight: 240}} onCopy={(e) => e.preventDefault()}>
            {/* Watermark full-screen-ish inside modal */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-white/10 text-6xl font-bold uppercase tracking-widest transform -rotate-12 select-none">SAMPLE PREVIEW</div>
            </div>

            <div className="relative z-10">
              {loading ? (
                <p className="text-gray-400">Loading preview...</p>
              ) : (
                <>
                  {contentType.startsWith('image/') && imageSrc ? (
                    <div className="flex items-center justify-center">
                      <img src={imageSrc} alt={file.fileName} className="max-h-[70vh] object-contain rounded-lg" />
                    </div>
                  ) : textContent ? (
                    <div className="prose max-h-[70vh] overflow-auto whitespace-pre-wrap select-none" style={{whiteSpace: 'pre-wrap'}}>
                      <div onCopy={(e) => e.preventDefault()} className="select-none text-sm text-gray-300">{textContent}</div>
                    </div>
                  ) : (
                    <div className="text-gray-400">Preview tidak tersedia untuk tipe file ini.</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
