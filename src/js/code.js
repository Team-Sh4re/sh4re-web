import { customFetch, formatISOToKoreanDate, getCookie } from "/js/common.js";
import "/styles/code.scss";
import hljs from "/js/highlight.js";

document.addEventListener("DOMContentLoaded", async () => {
  const codeElement = document.querySelector(".code");
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");
  const titleBox = document.querySelector(".title");
  const descriptionBox = document.querySelector(".description");
  const userInformationBox = document.querySelector(".user-info");
  const codeBox = document.querySelector(".code-text");
  const fullScreenIcon = document.getElementById("full-screen-icon");
  const likeIcon = document.getElementById("like-icon");
  const likeCount = document.querySelector(".like-count");
  const topBox = document.querySelector(".top-box");
  const copyButton = document.querySelector(".copy");
  const editButton = document.querySelector(".edit");
  const deleteButton = document.querySelector(".delete");
  const userNameText = document.querySelector(".user-name-text");
  const commentList = document.querySelector(".comment-list");
  const commentForm = document.querySelector(".comment-form");
  const commentInput = document.querySelector(".comment-input");
  const commentSubmitButton = document.querySelector(".comment-submit");
  let isCopied = false;
  let likeLoading = false;
  let createCommentLoading = false;

  const copySound = new Audio("/sounds/success.mp3");
  copySound.playbackRate = 1.7;
  copySound.volume = 1;

  const deleteComment = async (commentId, ele) => {
    if(!confirm("정말 해당 댓글을 삭제하시겠습니까?")) return;
    try {
      const res = await customFetch(`/codes/comment/${commentId}`, {
        method: "DELETE",
      });
      if(res.ok){
        ele.remove();
      }
    } catch(e) {
      alert("댓글 삭제 중 에러가 발생했습니다.")
      console.log(e);
    }
  }

  const paintComment = (comment, isNew = false) => {
    const newComment = document.createElement("li");
    newComment.classList.add("comment");
    const username = userNameText.innerText;
    const isAuthor = comment.author.username === username.slice(0, username.length - 1);
    newComment.innerHTML = `
        <div class="comment-info">
          <h3 class="comment-author">${comment.author.name}</h3>
          <h3 class="comment-date">${formatISOToKoreanDate(comment.createdAt)}</h3>
          ${isAuthor ? '<button class="comment-delete">댓글 삭제</button>' : ""}
        </div>
        <p class="comment-content">${comment.content}</p>
      `;
    if (isAuthor){
      newComment.querySelector(".comment-delete").addEventListener("click", async () => {
        await deleteComment(comment.id, newComment);
      })
    }
    if(isNew){
      commentList.prepend(newComment);
    } else commentList.appendChild(newComment);
  }

  async function renderCodeDetail(data) {
    const formattedStudentNumber = String(data.user.studentNumber).padStart(
      2,
      "0"
    );
    titleBox.innerText = data.title;
    userInformationBox.innerHTML = `<a href="/user?id=${data.user.id}" class="user-page">${data.user.grade}${data.user.classNumber}${formattedStudentNumber}${data.user.name}(${data.user.username})</a>`;
    descriptionBox.innerHTML = `
      ${data.description}
      <div id="watermark">
        <svg id="gpt-icon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 50 50">
          <path d="M45.403,25.562c-0.506-1.89-1.518-3.553-2.906-4.862c1.134-2.665,0.963-5.724-0.487-8.237	c-1.391-2.408-3.636-4.131-6.322-4.851c-1.891-0.506-3.839-0.462-5.669,0.088C28.276,5.382,25.562,4,22.647,4	c-4.906,0-9.021,3.416-10.116,7.991c-0.01,0.001-0.019-0.003-0.029-0.002c-2.902,0.36-5.404,2.019-6.865,4.549	c-1.391,2.408-1.76,5.214-1.04,7.9c0.507,1.891,1.519,3.556,2.909,4.865c-1.134,2.666-0.97,5.714,0.484,8.234	c1.391,2.408,3.636,4.131,6.322,4.851c0.896,0.24,1.807,0.359,2.711,0.359c1.003,0,1.995-0.161,2.957-0.45	C21.722,44.619,24.425,46,27.353,46c4.911,0,9.028-3.422,10.12-8.003c2.88-0.35,5.431-2.006,6.891-4.535	C45.754,31.054,46.123,28.248,45.403,25.562z M35.17,9.543c2.171,0.581,3.984,1.974,5.107,3.919c1.049,1.817,1.243,4,0.569,5.967	c-0.099-0.062-0.193-0.131-0.294-0.19l-9.169-5.294c-0.312-0.179-0.698-0.177-1.01,0.006l-10.198,6.041l-0.052-4.607l8.663-5.001	C30.733,9.26,33,8.963,35.17,9.543z M29.737,22.195l0.062,5.504l-4.736,2.805l-4.799-2.699l-0.062-5.504l4.736-2.805L29.737,22.195z M14.235,14.412C14.235,9.773,18.009,6,22.647,6c2.109,0,4.092,0.916,5.458,2.488C28,8.544,27.891,8.591,27.787,8.651l-9.17,5.294	c-0.312,0.181-0.504,0.517-0.5,0.877l0.133,11.851l-4.015-2.258V14.412z M6.528,23.921c-0.581-2.17-0.282-4.438,0.841-6.383	c1.06-1.836,2.823-3.074,4.884-3.474c-0.004,0.116-0.018,0.23-0.018,0.348V25c0,0.361,0.195,0.694,0.51,0.872l10.329,5.81	L19.11,34.03l-8.662-5.002C8.502,27.905,7.11,26.092,6.528,23.921z M14.83,40.457c-2.171-0.581-3.984-1.974-5.107-3.919	c-1.053-1.824-1.249-4.001-0.573-5.97c0.101,0.063,0.196,0.133,0.299,0.193l9.169,5.294c0.154,0.089,0.327,0.134,0.5,0.134	c0.177,0,0.353-0.047,0.51-0.14l10.198-6.041l0.052,4.607l-8.663,5.001C19.269,40.741,17.001,41.04,14.83,40.457z M35.765,35.588	c0,4.639-3.773,8.412-8.412,8.412c-2.119,0-4.094-0.919-5.459-2.494c0.105-0.056,0.216-0.098,0.32-0.158l9.17-5.294	c0.312-0.181,0.504-0.517,0.5-0.877L31.75,23.327l4.015,2.258V35.588z M42.631,32.462c-1.056,1.83-2.84,3.086-4.884,3.483	c0.004-0.12,0.018-0.237,0.018-0.357V25c0-0.361-0.195-0.694-0.51-0.872l-10.329-5.81l3.964-2.348l8.662,5.002	c1.946,1.123,3.338,2.937,3.92,5.107C44.053,28.249,43.754,30.517,42.631,32.462z" />
        </svg>
        <p id="generate-by-gpt">Generated by OpenAI GPT 4.1 nano</p>
      </div>
    `;
    const createdAt = document.createElement("p");
    createdAt.id = "createdAt";
    createdAt.innerText = `${formatISOToKoreanDate(data.createdAt)}에 공유됨`;
    topBox.appendChild(createdAt);
    if(new Date(data.updatedAt) - new Date(data.createdAt) > 1000 * 60){
      const updatedAt = document.createElement("p");
      updatedAt.id = "updatedAt";
      updatedAt.innerText = `(${formatISOToKoreanDate(data.updatedAt)}에 수정됨)`;
      topBox.appendChild(updatedAt);
    }
    if (data.liked) likeIcon.classList.add("liked");
    likeCount.innerText = data.likes;
    data.commentList.map(comment => {
      paintComment(comment);
    })
    if (data.code) {
      codeElement.textContent = data.code;
      await hljs.highlightAll();
    } else {
      console.error("서버에서 유효한 코드 데이터를 반환하지 않았습니다.");
    }
  }

  try {
    const res = await customFetch(`/codes/${postId}`, {
      method: "GET",
    });
    if (!res.ok) {
      console.error("HTTP 상태", res.status);
      return;
    }
    const data = res.data;
    const username = userNameText.innerText;
    if (data.user.username === username.slice(0, username.length - 1)) {
      editButton.classList.remove("hidden");
      deleteButton.classList.remove("hidden");
    }
    await renderCodeDetail(data);

    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
        codeElement.style.fontSize = "2.5rem";
      } else {
        codeElement.style.fontSize = "1.5rem";
      }
    });
    const fullscreenIcon = document.getElementById("full-screen-icon");
    fullscreenIcon.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        codeBox.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
        fullScreenIcon.innerHTML = `<path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 320c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0z"/>`;
      } else {
        fullScreenIcon.innerHTML = `<path d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z"/>`;
      }
    });

    likeIcon?.addEventListener("click", async () => {
      if (getCookie("accessToken") === "" || likeLoading) return;
      likeLoading = true;
      likeIcon.classList.toggle("liked");
      likeCount.innerText =
        Number(likeCount.innerText) +
        (likeIcon.classList.contains("liked") ? 1 : -1);
      await customFetch(`/codes/${postId}/like`, { method: "POST" });
      likeLoading = false;
    });

    copyButton?.addEventListener("click", () => {
      if (isCopied) return;
      isCopied = true;
      copyButton.classList.add("copied");
      setTimeout(() => {
        navigator.vibrate?.(100);
        window.navigator.clipboard.writeText(data.code);
        copyButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
          </svg>`;
        copySound.currentTime = 0;
        copySound.play();
        setTimeout(() => {
          copyButton.innerHTML = "코드 복사하기";
          copyButton.classList.remove("copied");
          isCopied = false;
        }, 1000);
      }, 400);
    });

    editButton?.addEventListener("click", () => {
      location.href = `/edit?id=${postId}`;
    })

    deleteButton?.addEventListener("click", async () => {
      try {
        if (!confirm("정말 이 코드를 삭제하시겠습니까?")) return;
        await customFetch(`/codes/${postId}`, { method: "DELETE" });
        location.href = "/";
      } catch {
        alert("게시물 삭제 중 오류가 발생했습니다.");
      }
    });

    commentForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if(createCommentLoading || !commentInput.value) return;
      const content = await commentInput.value;
      commentInput.value = "";
      try {
        createCommentLoading = true;
        commentSubmitButton.innerText = "로딩 중..";
        const res = await customFetch(`/codes/${postId}/comment`, {
          method: "POST",
          body: {
            content,
          }
        })
        if(res.ok) {
          paintComment(res.data.comment, true);
        }
      } catch(e){
        alert("댓글을 생성하는 중 에러가 발생하였습니다.")
        console.log(e);
      } finally {
        commentSubmitButton.innerText = "댓글 작성";
        createCommentLoading = false;
      }
    })
  } catch (e) {
    console.error("API 요청 중 에러", e);
  }
});
