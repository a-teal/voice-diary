import * as React from "react";
import { cn } from "./utils";

type LiveTextareaProps = React.ComponentProps<"textarea"> & {
  /**
   * Live transcript text from STT (optional).
   * If provided, the component will merge it into the textarea value.
   */
  liveText?: string;
  /**
   * How to merge liveText into current value:
   * - "replace": value becomes liveText (dangerous for IME unless guarded)
   * - "append": append liveText to the end
   */
  liveMergeMode?: "replace" | "append";
};

function Textarea({
  className,
  value,
  onChange,
  liveText,
  liveMergeMode = "replace",
  ...props
}: LiveTextareaProps) {
  const isComposingRef = React.useRef(false);
  const pendingLiveRef = React.useRef<string | null>(null);

  // 로컬 draft: 조합 중에는 이 값을 화면에 보여줌
  const [draft, setDraft] = React.useState<string>(String(value ?? ""));

  // 외부 value 변경이 들어오면 draft도 동기화 (단, 조합 중에는 건드리지 않음)
  React.useEffect(() => {
    if (!isComposingRef.current) {
      setDraft(String(value ?? ""));
    }
  }, [value]);

  // liveText가 들어오면 조합 상태에 따라 반영/보류
  React.useEffect(() => {
    if (liveText == null) return;

    if (isComposingRef.current) {
      // ✅ 조합 중에는 라이브 업데이트 보류
      pendingLiveRef.current = liveText;
      return;
    }

    // ✅ 조합 중이 아닐 때만 반영
    const base = String(value ?? "");
    const next =
      liveMergeMode === "append" ? `${base}${liveText}` : String(liveText);

    setDraft(next);

    // 상위에도 알려야 controlled 입력에서 일관됨
    if (onChange) {
      // React.ChangeEvent를 직접 만들 수 없어서, target value만 맞춘 형태로 캐스팅
      onChange({ target: { value: next } } as any);
    }
  }, [liveText]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
      value={draft}
      onCompositionStart={(e) => {
        isComposingRef.current = true;
        setDraft(e.currentTarget.value);
        props.onCompositionStart?.(e);
      }}
      onCompositionEnd={(e) => {
        isComposingRef.current = false;

        let next = e.currentTarget.value;

        // ✅ 조합 중에 들어온 liveText가 있으면 여기서 한 번에 반영
        if (pendingLiveRef.current != null) {
          const live = pendingLiveRef.current;
          pendingLiveRef.current = null;

          next =
            liveMergeMode === "append" ? `${next}${live}` : String(live);

          setDraft(next);

          if (onChange) onChange({ target: { value: next } } as any);
        } else {
          setDraft(next);
          if (onChange) onChange(e as any);
        }

        props.onCompositionEnd?.(e);
      }}
      onChange={(e) => {
        const next = e.currentTarget.value;

        // ✅ 조합 중에는 로컬 draft만 업데이트, 상위로 올리지 않음
        if (isComposingRef.current) {
          setDraft(next);
          return;
        }

        setDraft(next);
        onChange?.(e);
      }}
    />
  );
}

export { Textarea };
