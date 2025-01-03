import { useMutation, useQuery, useQueryClient } from 'react-query';
import { apiDeleteFolder, apiGetFolder } from '../api';
import { useEffect, useState } from 'react';
import MemoModal from './MemoModal';
import { ClipLoader } from 'react-spinners';
import checkTrue from "../assets/check_true.svg";
import checkFalse from "../assets/check_false.svg";
import trash from "../assets/trash.svg";
import { AnimatePresence, motion } from "framer-motion";

export default function FolderList({ folderIconColor, openFolderIconColor, baseColor, activeMenu, setActiveMenu }) {
    // 폴더 리스트 불러오기
    const { data, isLoading } = useQuery("getFolder", apiGetFolder);
    // 폴더 아이디 담기(폴더 클릭 시 메모를 불러오기 위해 => MemoModal 컴포넌트로 전달)
    const [folderID, setFolderID] = useState(null);
    // 폴더 제목(폴더 클릭 시 제목을 불러오기 위해 => MemoModal 컴포넌트로 전달 )
    const [folderName, setFolderName] = useState(null);
    // 폴더 삭제 체크 true/false (상태를 배열로 관리)
    const [checkedItem, setCheckedItem] = useState([]);
    // 삭제 후 폴더 리스트 리렌더링
    const queryClient = useQueryClient();

    // 폴더 리스트 데이터 로드 시 삭제 체크 상태 초기화
    useEffect(() => {
        if (data?.data) {
            setCheckedItem(data.data.map(() => false));
        }
    }, [data]);
    // activeMenu가 1이 아닐 때 체크 상태 초기화
    useEffect(() => {
        if (activeMenu !== 1) {
            setCheckedItem((prevState) => prevState.map(() => false));
        }
    }, [activeMenu]);
    // 폴더 인덱스에 따라 체크 상태 변경
    const checkChange = (index) => {
        setCheckedItem((prevState) => {
            const newState = [...prevState]; // 이전 상태 복사
            newState[index] = !newState[index]; // 클릭한 인덱스 상태 반전
            return newState; // 업데이트 배열 리턴
        });
    };
    // 폴더 삭제 API
    const { mutate, isLoading: isDeleting } = useMutation(apiDeleteFolder, {
        onSuccess: (data) => {
            queryClient.invalidateQueries("getFolder"); // 폴더 리스트 리랜더링
            setCheckedItem([]); // 체크 상태 초기화
            if (data.result) {
                setActiveMenu(null);
            }
        },
    });
    // 삭제 버튼 클릭 시
    const folderDelete = () => {
        const checkedIds = data?.data
            .filter((_, index) => checkedItem[index]) // 체크된 폴더만 필터링
            .map((item) => item._id); // 체크된 폴더의 _id만 추출
        if (checkedIds.length > 0) {
            mutate(checkedIds); // 폴더 삭제 API 호출
        }
    };

    return (
        <>
            <div className="min-h-[calc(100vh-157px)] p-4 flex flex-wrap justify-start content-start gap-8 relative">
                {/* 폴더 로딩 */}
                {isLoading ? (
                    <div className="w-full h-full flex justify-center items-center">
                        <ClipLoader />
                    </div>
                ) : (
                    /* 폴더 리스트 랜더링 */
                    data?.data?.map((item, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center basis-16 cursor-pointer relative"
                            onClick={() => {
                                setFolderID(item._id);
                                setFolderName(item.folderName);
                            }}
                        >
                            {/* 메모가 있으면 열린 폴더, 없으면  닫힌 폴더*/}
                            <img src={item.existMemo === 1 ? openFolderIconColor : folderIconColor} alt="folder" className="h-10" />
                            <span>{item.folderName}</span>
                            {
                                activeMenu === 1 &&
                                <form className="flex w-full h-full absolute"
                                    onClick={(e) => e.stopPropagation()}>
                                    <input type="checkbox" id={`checkbox-${index}`}
                                        checked={checkedItem[index] || false} onChange={() => checkChange(index)}
                                        className="appearance-none" />
                                    <label htmlFor={`checkbox-${index}`}
                                        className="w-full h-full flex justify-center items-center cursor-pointer">
                                        <img src={checkedItem[index] ? checkTrue : checkFalse} alt="checkImg" />
                                    </label>
                                </form>
                            }
                        </div>
                    ))
                )}
                {/* 폴더 삭제 클릭 시 삭제 아이콘 */}
                <AnimatePresence>
                    {
                        activeMenu === 1 &&
                        <motion.div
                            initial={{ y: 100, x: "-50%", opacity: 0 }} // 시작 위치
                            animate={{ y: 0, opacity: 1 }}  // 화면에 나타나는 위치
                            exit={{ y: 100, opacity: 0 }}   // 사라질 때 위치 (optional)
                            transition={{ duration: 0.5 }}  // 애니메이션 지속 시간
                            className="fixed bottom-24 left-1/2 -translate-x-1/2 cursor-pointer py-4"
                            onClick={folderDelete}>
                            {
                                isDeleting ? <ClipLoader /> : <img src={trash} alt="trash-icon" />
                            }
                        </motion.div>

                    }
                </AnimatePresence>
            </div>
            {
                // 폴더 클릭 시 메모 모달 오픈
                folderID &&
                <section className="w-full h-full p-8 absolute top-0 left-0 bg-black bg-opacity-50 z-10">
                    <MemoModal folderID={folderID} folderName={folderName} setFolderID={setFolderID} setFolderName={setFolderName} baseColor={baseColor} />
                </section>
            }
        </>
    );
}
