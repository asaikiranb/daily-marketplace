'use client';

const CATEGORIES = [
    'All',
    'Tutoring',
    'Moving Help',
    'Cleaning',
    'Tech Support',
    'Photography',
    'Pet Care',
    'Rides',
    'Food & Cooking',
    'Fitness',
    'Other',
];

export { CATEGORIES };

export default function SearchFilter({ searchQuery, onSearchChange, selectedCategory, onCategoryChange }) {
    return (
        <div className="search-bar">
            <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search services, providers..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
            >
                {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
        </div>
    );
}
