import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import mammoth from 'mammoth/mammoth.browser';

const resolveUrl = (fileUrl) => {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl;
  return `${API.defaults.baseURL.replace(/\/api$/, '')}${fileUrl}`;
};

const FilePreviewPage = () => {
  const loc = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(loc.search);
  const fileUrlParam = params.get('fileUrl') || '';
  const fileName = params.get('fileName') || '';

  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchAndConvert = async () => {
      if (!fileUrlParam) return;
      setLoading(true);
      setContentType('');
      setImageSrc(null);
      setTextContent('');
      try {
        const url = resolveUrl(decodeURIComponent(fileUrlParam));
        const res = await API.get(url, { responseType: 'blob' });
        const blob = res.data;
        const type = blob.type || res.headers['content-type'] || '';
        if (cancelled) return;
        setContentType(type);
        if (type.startsWith('image/')) {
          const obj = URL.createObjectURL(blob);
          setImageSrc(obj);
        } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || (fileName && fileName.toLowerCase().endsWith('.docx'))) {
          try {
            const arrayBuffer = await blob.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const tmp = document.createElement('div');
            tmp.innerHTML = result.value || '';
            const plain = tmp.innerText || tmp.textContent || '';
            setTextContent(plain);
          } catch (e) {
            console.error(e);
            setTextContent('Tidak dapat menampilkan preview untuk file ini.');
          }
        } else {
          try {
            const txt = await blob.text();
            setTextContent(txt);
          } catch (e) {
            setTextContent('Preview tidak tersedia untuk tipe file ini.');
          }
        }
      } catch (err) {
        console.error(err);
        setTextContent('Gagal memuat preview file.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAndConvert();
    return () => { cancelled = true; };
  }, [fileUrlParam, fileName]);

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition text-sm">← Back</button>
          <span className="text-lg font-bold">Preview: {fileName}</span>
          <div />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 pt-32 pb-16">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <p className="text-gray-400 text-sm mb-2">{contentType}</p>
          <div className="relative bg-black rounded-xl p-6 text-white" style={{minHeight: '60vh'}} onCopy={(e) => e.preventDefault()}>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-white/10 text-8xl font-bold uppercase tracking-widest transform -rotate-12 select-none">SAMPLE PREVIEW</div>
            </div>

            <div className="relative z-10">
              {loading ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <> 
                  {imageSrc ? (
                    <img src={imageSrc} alt={fileName} className="mx-auto max-h-[80vh] object-contain" />
                  ) : (
                    <div className="prose max-h-[80vh] overflow-auto select-none whitespace-pre-wrap text-gray-200" style={{whiteSpace: 'pre-wrap'}}>
                      {textContent || <p className="text-gray-400">Preview tidak tersedia.</p>}
                    </div>
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

export default FilePreviewPage;
