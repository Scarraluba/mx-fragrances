import { 
  X, Menu, Plus, Trash2, ChevronRight, Lock, ArrowLeft,
  Package, Star, Eye, History, Edit, BarChart3, Users, 
  DollarSign, Settings, TrendingUp, AlertTriangle, 
  ShieldCheck, User, LogOut, Upload, ShoppingCart, Printer, FileText, Truck,
  Undo, Save, Globe, ArrowUpDown, ArrowUp, ArrowDown, Shield, Search,
  Bell, ChevronDown, MessageSquare, CornerDownLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Accordion = ({ title, icon: Icon, children, isOpen, onToggle, badge, rightElement }) => {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-sm shadow-lg mb-4 overflow-hidden">
      <div className="w-full flex justify-between items-center p-4 bg-[#1A1A1A] hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-3">
          {Icon && <Icon size={16} className="text-[#D4AF37]" />}
          <span className="text-white text-sm font-bold uppercase tracking-widest">{title}</span>
          {badge && (typeof badge === 'string' ? <span className="bg-[#D4AF37] text-black text-[9px] px-2 py-0.5 rounded-sm font-bold">{badge}</span> : badge)}
        </div>
        <div className="flex items-center gap-4">
          {rightElement && <div onClick={e => e.stopPropagation()}>{rightElement}</div>}
          <ChevronDown size={16} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="p-4 border-t border-white/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;
