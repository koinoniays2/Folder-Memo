export default function InputWindow({ children, handleSubmit, onValid }) {
    return (
        <section className="w-full min-h-screen p-4 flex justify-center items-center">
            <div className="w-full max-w-80 min-w-80 border-black border rounded-xl
            shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
                <div className="p-1 border-black rounded-t-xl border-b bg-color-hotpink">
                    Memo
                </div>
                <div className="w-full p-5 bg-[#F6F6F6] rounded-b-xl">
                    {/* 전달받은 props - handleSubmit, onValid */}
                    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-12">
                        { children }
                    </form>
                </div>
            </div>
        </section>
    )
}
