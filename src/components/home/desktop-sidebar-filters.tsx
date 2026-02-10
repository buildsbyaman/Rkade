import React, { useState } from 'react'

type FilterOption = {
  id: string;
  label: string;
  count?: number;
}

type FilterSection = {
  id: string;
  title: string;
  type: 'checkbox' | 'radio' | 'range';
  options: FilterOption[];
  selected?: string[];
}

type Props = {
  filters: FilterSection[];
  onFilterChange?: (sectionId: string, selectedOptions: string[]) => void;
}

// Chevron Down Icon Component
const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg 
    className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

export default function DesktopSidebarFilters({ filters, onFilterChange }: Props) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [openSection, setOpenSection] = useState<string | null>(null) // Only one section can be open at a time

  const handleFilterChange = (sectionId: string, optionId: string, isChecked: boolean) => {
    const currentSelection = selectedFilters[sectionId] || []
    let newSelection: string[]

    if (isChecked) {
      newSelection = [...currentSelection, optionId]
    } else {
      newSelection = currentSelection.filter(id => id !== optionId)
    }

    setSelectedFilters(prev => ({
      ...prev,
      [sectionId]: newSelection
    }))

    onFilterChange?.(sectionId, newSelection)
  }

  const toggleSection = (sectionId: string) => {
    setOpenSection(prev => prev === sectionId ? null : sectionId)
  }

  return (
    <div className="w-[200px] sticky top-[140px] h-fit">
      {/* Filter Sections */}
      <div className="space-y-[4px]">
        {filters.map((section) => {
          const isOpen = openSection === section.id
          const hasSelectedFilters = (selectedFilters[section.id] || []).length > 0
          
          return (
            <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Section Header - Clickable */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  <h4 className="text-[18px] font-semibold text-black">{section.title}</h4>
                  {hasSelectedFilters && (
                    <span className="bg-sky-600 text-white text-xs px-2 py-1 rounded-full">
                      {selectedFilters[section.id].length}
                    </span>
                  )}
                </div>
                <ChevronDownIcon isOpen={isOpen} />
              </button>
              
              {/* Section Options - Collapsible */}
              <div className={`transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              } overflow-hidden`}>
                <div className="p-4 pt-0 bg-gray-50">
                  <div className="flex flex-wrap gap-[6px]">
                    {section.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          const isSelected = (selectedFilters[section.id] || []).includes(option.id)
                          handleFilterChange(section.id, option.id, !isSelected)
                        }}
                        className={`px-3 py-1.5 rounded-full border text-[13px] transition-all duration-200 ${
                          (selectedFilters[section.id] || []).includes(option.id)
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-gray-300 hover:border-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Default filter data
export const defaultFilters: FilterSection[] = [
  {
    id: 'category',
    title: 'Category',
    type: 'checkbox',
    options: [
      { id: 'comedy', label: 'Comedy' },
      { id: 'music', label: 'Music' },
      { id: 'workshop', label: 'Workshop' },
      { id: 'kids', label: 'Kids' },
      { id: 'exhibition', label: 'Exhibition' },
      { id: 'others', label: 'Others' },
    ]
  },
  {
    id: 'date',
    title: 'Date',
    type: 'checkbox',
    options: [
      { id: 'today', label: 'Today' },
      { id: 'tomorrow', label: 'Tomorrow' },
      { id: 'this-week', label: 'This Week' },
      { id: 'this-month', label: 'This Month' },
      { id: 'others', label: 'Others' },
    ]
  },
  {
    id: 'language',
    title: 'Language',
    type: 'checkbox',
    options: [
      { id: 'english', label: 'English' },
      { id: 'hindi', label: 'Hindi' },
      { id: 'punjabi', label: 'Punjabi' },
      { id: 'others', label: 'Others' },
    ]
  },
  {
    id: 'price',
    title: 'Price',
    type: 'checkbox',
    options: [
      { id: 'free', label: 'Free' },
      { id: 'under-1000', label: 'Under 1000' },
      { id: 'under-2000', label: 'Under 2000' },
      { id: 'above-2000', label: 'Above 2000' },
    ]
  },
  {
    id: 'age-rating',
    title: 'Age Rating',
    type: 'checkbox',
    options: [
      { id: 'u', label: 'U' },
      { id: 'ua', label: 'U/A' },
      { id: 'a', label: 'A' },
      { id: 'pg13', label: 'PG13' },
    ]
  }
]