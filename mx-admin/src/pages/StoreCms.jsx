/**
 * Project: mxfrragrance
 * Created: 2026/05/18 13:53
 * Author: Scarra Luba
 */

import { useState, useEffect } from "react";
import useAppContext from "../context/app/UseAppContext";
import { listenContent, createContent,updateContent } from "../helpers/Storefront.js";
import { 
  X, Menu, Plus, Trash2, ChevronRight, Lock, ArrowLeft,
  Package, Star, Eye, History, Edit, BarChart3, Users, 
  DollarSign, Settings, TrendingUp, AlertTriangle, 
  ShieldCheck, User, LogOut, Upload, ShoppingCart, Download,
  Search, ArrowUpDown, ArrowUp, ArrowDown, Shield, Printer, FileText, CheckCircle2, Truck,
  Undo, Save, Globe
} from 'lucide-react';

const inputClass = "w-full bg-[#1A1A1A] border border-white/10 p-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm shadow-inner";
const labelClass = "text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1.5 block";
const btnClass = "bg-[#D4AF37] text-black px-4 py-2 font-bold uppercase tracking-widest text-[10px] rounded-sm hover:bg-white transition-colors shadow-sm disabled:opacity-50";
const cardClass = "bg-[#111111] border border-white/5 rounded-sm p-5 shadow-lg relative overflow-hidden";

const INITIAL_STOREFRONT = {
    about: {
        heading1: "Curating the",
        heading2: "Invisible Art.",
        philosophy: "MX Fragrances was born from a singular obsession: the preservation of olfactory history. We do not manufacture; we discover.",
        quote: "Fragrance is a liquid emotion. Once a batch is gone, its specific alchemy is lost to time. Our mission is to find those lost treasures and place them in the hands of true connoisseurs.",
        description: "While most retailers focus on the new, we focus on the exceptional. This includes sealed vintage batches, limited boutique runs, and carefully vetted pieces from the most prestigious private collections in South Africa."
    },
    contact: {
        heading1: "Connect",
        heading2: "with the Vault.",
        description: "For private sourcing requests, authentication queries, or to discuss a piece from your own collection, you may contact me directly through our private channel.",
        instagram: "@mxfragrances",
        tiktok: "@mxfragrances"
    }
};

const StoreCms = () => {

    const { confirm } = useAppContext();
     const [storefrontContent, setStorefrontContent] = useState(() => {
            const saved = localStorage.getItem("mx_vault_storefront_v6");
            return saved ? JSON.parse(saved) : INITIAL_STOREFRONT;
        });
    
    
        useEffect(() => {
            let isMounted = true;
    
            const unsubProducts = listenContent(async (response) => {
    
                if (!isMounted) return;
    
                if (response.success) {
                    if (response.data && response.data.length > 0) {
                        setStorefrontContent(response.data[0]);
                        console.log("Storefront content updated:", response.data);
                    } else {
                        await createContent(INITIAL_STOREFRONT);
                    }
                }
            });
    
            return () => {
                isMounted = false;
                if (typeof unsubProducts === 'function') {
                    unsubProducts();
                }
            };
        }, []);

  useEffect(() => {

    localStorage.setItem('mx_vault_storefront_v6', JSON.stringify(storefrontContent));
  }, [storefrontContent]);

const [cmsTab, setCmsTab] = useState('about');
  const [localDraft, setLocalDraft] = useState(() => {
    const savedDraft = localStorage.getItem("mx_vault_storefront_draft");
    return savedDraft ? JSON.parse(savedDraft) : storefrontContent;
  });
  const [lastSaved, setLastSaved] = useState(localDraft);
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("mx_vault_storefront_draft")) {
      setLocalDraft(storefrontContent);
      setLastSaved(storefrontContent);
    }
  }, [storefrontContent]);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleSaveDraft = () => {
    localStorage.setItem("mx_vault_storefront_draft", JSON.stringify(localDraft));
    setHistory(prev => [lastSaved, ...prev].slice(0, 3));
    setLastSaved(localDraft);
    showMsg('Draft saved locally.');
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prev = history[0];
      setLocalDraft(prev);
      setLastSaved(prev);
      setHistory(h => h.slice(1));
      showMsg('Reverted to previous saved draft.');
    }
  };

  const handleDeploy = () => {
    confirm("Deploying these changes will instantly overwrite the live storefront content on Firebase. Proceed?", async () => {
      setIsDeploying(true);
      try {
       // const storefrontRef = doc(db, 'artifacts', appId, 'public', 'data', 'storefrontConfig', 'content');
      // console.log("Deploying to Firebase with content:", storefrontContent.id);
       await updateContent(storefrontContent.id, localDraft);
        
        localStorage.removeItem("mx_vault_storefront_draft");
        setHistory([]);
        setLastSaved(localDraft);
        showMsg('Deployed to live Firebase storefront successfully.');
      } catch(e) {
        console.error(e);
        showMsg('Firebase deployment failed.');
      }
      setIsDeploying(false);
    });/**/
  };

  const updateDraft = (section, field, value) => {
    setLocalDraft(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };
    return (    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between p-6 items-start md:items-center gap-4 mb-6 border-b border-white/5 pb-6">
          <div>
            <h2 className="text-2xl font-serif text-white tracking-tight">Storefront CMS</h2>
            <p className="text-white/40 text-xs font-light mt-1">Manage public-facing narratives and contact details.</p>
            <div className="flex gap-4 mt-4">
              <button onClick={() => setCmsTab('about')} className={`text-[10px] uppercase tracking-widest font-bold transition-all pb-2 border-b-2 ${cmsTab === 'about' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/40 hover:text-white'}`}>About Page</button>
              <button onClick={() => setCmsTab('contact')} className={`text-[10px] uppercase tracking-widest font-bold transition-all pb-2 border-b-2 ${cmsTab === 'contact' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/40 hover:text-white'}`}>Contact Page</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button onClick={handleUndo} disabled={history.length === 0} className="bg-white/5 disabled:opacity-30 hover:bg-white/10 text-white px-4 py-2 font-bold uppercase tracking-widest text-[10px] rounded-sm transition-colors flex items-center gap-2"><Undo size={14}/> Undo ({history.length})</button>
            <button onClick={handleSaveDraft} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 font-bold uppercase tracking-widest text-[10px] rounded-sm transition-colors flex items-center gap-2"><Save size={14}/> Save Draft</button>
            <button onClick={handleDeploy} disabled={isDeploying} className={btnClass + " flex items-center gap-2"}><Globe size={14}/> {isDeploying ? 'Deploying...' : 'Deploy Live'}</button>
          </div>
        </div>

        {msg && <div className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 p-3 text-[10px] uppercase tracking-widest rounded-sm font-bold">{msg}</div>}

        <div className={cardClass}>
          {cmsTab === 'about' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2 text-white/80 text-xs uppercase tracking-widest font-bold border-b border-white/10 pb-2">About Page Configuration</div>
              <div><label className={labelClass}>Hero Heading Line 1</label><input className={inputClass} value={localDraft.about.heading1} onChange={e => updateDraft('about', 'heading1', e.target.value)} /></div>
              <div><label className={labelClass}>Hero Heading Line 2 (Italic)</label><input className={inputClass} value={localDraft.about.heading2} onChange={e => updateDraft('about', 'heading2', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Philosophy Text</label><textarea rows={3} className={inputClass} value={localDraft.about.philosophy} onChange={e => updateDraft('about', 'philosophy', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Highlighted Quote</label><textarea rows={2} className={inputClass} value={localDraft.about.quote} onChange={e => updateDraft('about', 'quote', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Secondary Description</label><textarea rows={3} className={inputClass} value={localDraft.about.description} onChange={e => updateDraft('about', 'description', e.target.value)} /></div>
            </div>
          )}

          {cmsTab === 'contact' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2 text-white/80 text-xs uppercase tracking-widest font-bold border-b border-white/10 pb-2">Contact Page Configuration</div>
              <div><label className={labelClass}>Hero Heading Line 1</label><input className={inputClass} value={localDraft.contact.heading1} onChange={e => updateDraft('contact', 'heading1', e.target.value)} /></div>
              <div><label className={labelClass}>Hero Heading Line 2 (Italic)</label><input className={inputClass} value={localDraft.contact.heading2} onChange={e => updateDraft('contact', 'heading2', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Inquiry Description</label><textarea rows={3} className={inputClass} value={localDraft.contact.description} onChange={e => updateDraft('contact', 'description', e.target.value)} /></div>
              <div><label className={labelClass}>Instagram Handle</label><input className={inputClass} value={localDraft.contact.instagram} onChange={e => updateDraft('contact', 'instagram', e.target.value)} /></div>
              <div><label className={labelClass}>TikTok Handle</label><input className={inputClass} value={localDraft.contact.tiktok} onChange={e => updateDraft('contact', 'tiktok', e.target.value)} /></div>
            </div>
          )}
        </div>
    </div>)
}   

export default StoreCms;