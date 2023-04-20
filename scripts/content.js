let length = 0;
let prevLength = 0;
let owner = "";
let prevOwner = "";
let outgoing = [];
(() => {
  let found = false;
  setInterval(() => {
    const siblingNode = document.querySelector(
      `div[data-testid="compose-box"] > span:nth-of-type(2) > div:first-of-type > div:nth-of-type(2) > div:first-of-type`
    );
    owner = document.querySelector(
      `span[data-testid="conversation-info-header-chat-title"]`
    )?.textContent;
    const messageBlocks = document.querySelectorAll(
      `div[role="application"] div[class][role="row"] div[class*="message-"]`
    );

    length = messageBlocks?.length;

    if (found || length !== prevLength) gatherIntel(messageBlocks);
    if ((siblingNode && !found) || prevOwner !== owner) {
      prevOwner = owner;
      found = true;
      const elementId = generateUUID();
      new Promise((res, rej) => {
        siblingNode.insertAdjacentHTML(
          "afterend",
          `
          <div id="${elementId}">
            <i class="fa-solid fa-robot"></i>
          </div>
          
          <style>
            #${elementId} {
                width: 40px;
                min-width: 40px;
                height: 40px;
                align-self: center;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                border-radius: 5px;
                box-sizing: border-box;
            }
            #${elementId} > i {
                color: #54656f;
            }
            #${elementId}:active {
                border: 2px solid #54656f;
            }
          </style>
          `
        );
        res();
      })
        .then(() => {
          gatherIntel(messageBlocks);
          document
            .querySelector(`#${elementId}`)
            .addEventListener("click", () => {
              console.log(outgoing);
            });
        })
        .catch((err) => {});
    } else if (!siblingNode) found = false;
  }, 1000);
})();

function generateUUID() {
  let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let uuid = "";
  for (let i = 0; i < 16; i++) {
    let charIndex = Math.floor(Math.random() * chars.length);
    uuid += chars.charAt(charIndex);
  }
  return `_${uuid}`;
}

function gatherIntel(messageBlocks) {
  prevLength = length;
  const messages = Array.from(messageBlocks)
    .map((messageBlock) => {
      let sent = messageBlock.getAttribute("class").split(" ");
      const message = messageBlock.querySelector(
        `span.copyable-text.selectable-text`
      )?.textContent;
      const forwarded = messageBlock.querySelector(
        `span[data-testid="forwarded"]`
      )
        ? true
        : false;
      const time = messageBlock
        .querySelector(`div[data-pre-plain-text]`)
        ?.getAttribute("data-pre-plain-text")
        ?.split(/[\[\]]/)[1];
      if (!message) return;
      return {
        sent: sent.includes("message-out"),
        message,
        forwarded,
        time,
      };
    })
    .filter((messageBlock) => messageBlock);
  outgoing = messages;
}
