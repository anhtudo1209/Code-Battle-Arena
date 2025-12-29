// This utility file exports a hook to set page titles dynamically
// Import this in each page component and call it to set the title

import { useEffect } from "react";

export function usePageTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} - Code Battle Arena` : "Code Battle Arena";
    }, [title]);
}
