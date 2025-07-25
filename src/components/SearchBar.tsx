import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTranslation } from 'react-i18next';
import { useComponentAnalytics } from '@/hooks/useAnalytics';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  useComponentAnalytics('SearchBar', { hasQuery: !!searchQuery });
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-md mb-8 px-6 relative">
      <Search className="absolute left-9 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
      <Input
        type="text"
        placeholder={t('placeholders.searchTodosShortcut')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-12 pr-12 py-3 text-base rounded-xl border-0 shadow-sm bg-white/70 backdrop-blur-sm focus:shadow-md transition-all duration-200 focus:bg-white"
      />
      {searchQuery && (
        <div className="absolute right-9 top-1/2 transform -translate-y-1/2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            onClick={() => setSearchQuery("")}
          >
            ×
          </Button>
        </div>
      )}
    </div>
  );
}