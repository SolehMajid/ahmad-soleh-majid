function getData() {
  const data = fetch('./data.json').then(res => res.json())
  return data
}


async function friendListsElement() {
  const friendLists = document.getElementById("friend_list");
  const data = await getData() 
  const lists = `
    ${data.map(i => `
      <li>
        <figure class="card">
          <div class="card_header">
            <div class="card_image">
              <img src="${i.fotoselfie}" alt="${i.nama}" width="100%">
            </div>
            <div class="card_description">
              <span>${i.nama}</span>
              <span>${parseInt(i.nim)}</span>
            </div>
          </div>
          <figcaption class="card_content">
            <span>TTL : ${i.ttl}</span>
            <span>Alamat : ${i.alamat}</span>
            <span>NoHP : ${i.no}</span>
          </figcaption>
        </figure>
      </li>
    `).join("")}
  `;

  return friendLists.innerHTML = lists
}

friendListsElement()