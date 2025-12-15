import { ExternalLink, ImageIcon, AlertCircle } from "lucide-react";

interface MessageContentProps {
  content: string;
  className?: string;
}

  // Parse message content and render images, URLs, and code interpreter outputs
export function MessageContent({ content, className = "" }: MessageContentProps) {
  // Detect if content contains markdown images: ![alt](url)
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  // Detect sandbox URLs from OpenAI Code Interpreter
  const sandboxUrlRegex = /sandbox:\/\/[^\s)]+/g;
  
  // Detect if content contains raw image URLs
  const imageUrlRegex = /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?[^\s]*)?)/gi;
  
  // Detect URLs for linking
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const renderContent = () => {
    let parts: JSX.Element[] = [];
    let lastIndex = 0;
    let partKey = 0;

    // First, check for markdown images
    const markdownImages = Array.from(content.matchAll(markdownImageRegex));
    
    if (markdownImages.length > 0) {
      markdownImages.forEach((match) => {
        const fullMatch = match[0];
        const alt = match[1];
        const url = match[2];
        const index = match.index || 0;

        // Add text before the image
        if (index > lastIndex) {
          const textBefore = content.substring(lastIndex, index);
          parts.push(
            <span key={`text-${partKey++}`}>
              {renderTextWithLinks(textBefore)}
            </span>
          );
        }

        // Check if this is a sandbox URL
        if (url.startsWith('sandbox://')) {
          // Show info message for sandbox URLs
          parts.push(
            <div key={`sandbox-${partKey++}`} className="my-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Code Interpreter Generated Content
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                    {alt || "Chart/Graph generated"} - Configure n8n to convert sandbox URLs to public URLs
                  </p>
                  <code className="text-xs text-muted-foreground block mt-1 break-all">
                    {url}
                  </code>
                </div>
              </div>
            </div>
          );
        } else {
          // Regular image URL - render the image
          parts.push(
            <div key={`img-${partKey++}`} className="my-3">
              <img
                src={url}
                alt={alt || "AI generated content"}
                className="rounded-lg max-w-full h-auto border border-border shadow-md"
                loading="lazy"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none';
                  console.error('Failed to load image:', url);
                }}
              />
              {alt && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {alt}
                </p>
              )}
            </div>
          );
        }

        lastIndex = index + fullMatch.length;
      });

      // Add remaining text after last image
      if (lastIndex < content.length) {
        const remainingText = content.substring(lastIndex);
        parts.push(
          <span key={`text-${partKey++}`}>
            {renderTextWithLinks(remainingText)}
          </span>
        );
      }

      return <div className={className}>{parts}</div>;
    }

    // Check for raw image URLs (not in markdown format)
    const rawImages = Array.from(content.matchAll(imageUrlRegex));
    
    if (rawImages.length > 0) {
      rawImages.forEach((match) => {
        const url = match[0];
        const index = match.index || 0;

        // Add text before the image
        if (index > lastIndex) {
          const textBefore = content.substring(lastIndex, index);
          parts.push(
            <span key={`text-${partKey++}`}>
              {renderTextWithLinks(textBefore)}
            </span>
          );
        }

        // Add the image
        parts.push(
          <div key={`img-${partKey++}`} className="my-3">
            <img
              src={url}
              alt="AI generated content"
              className="rounded-lg max-w-full h-auto border border-border shadow-md"
              loading="lazy"
              onError={(e) => {
                // Fallback if image fails to load - show as link instead
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline flex items-center gap-1">
                    <span>View Image</span>
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>`;
                }
              }}
            />
          </div>
        );

        lastIndex = index + url.length;
      });

      // Add remaining text
      if (lastIndex < content.length) {
        const remainingText = content.substring(lastIndex);
        parts.push(
          <span key={`text-${partKey++}`}>
            {renderTextWithLinks(remainingText)}
          </span>
        );
      }

      return <div className={className}>{parts}</div>;
    }

    // No images found, just render text with clickable links
    return (
      <div className={className}>
        {renderTextWithLinks(content)}
      </div>
    );
  };

  // Helper function to make URLs clickable
  const renderTextWithLinks = (text: string) => {
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="break-all">{part}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return renderContent();
}

