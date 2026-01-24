import { useEffect } from "react";

export default function PageTitle({ title }) {
    useEffect(() => {
        document.title = title ? `${title} - Code Battle Arena` : "Code Battle Arena";
    }, [title]);

    return null;
}
