import data from './informatika-2024.json'
console.log(data)

// const friendsData = [
//   {
//     nama: "John Doe Evan Rafa Radya Alifian",
//     nim: "240411100063",
//     ttl: "Bangkalan 19 Oktober 2005",
//     alamat: "Bangkalan",
//     noHP: "+6287852386596",
//     photo: "./assets/baby.jpg"
//   },
//   {
//     nama: "John Doe Evan Rafa Radya Alifian",
//     nim: "240411100063",
//     ttl: "Bangkalan 19 Oktober 2005",
//     alamat: "Bangkalan",
//     noHP: "+6287852386596",
//     photo: "./assets/baby.jpg"
//   },
//   {
//     nama: "John Doe Evan Rafa Radya Alifian",
//     nim: "240411100063",
//     ttl: "Bangkalan 19 Oktober 2005",
//     alamat: "Bangkalan",
//     noHP: "+6287852386596",
//     photo: "./assets/baby.jpg"
//   },
//   {
//     nama: "John Doe Evan Rafa Radya Alifian",
//     nim: "240411100063",
//     ttl: "Bangkalan 19 Oktober 2005",
//     alamat: "Bangkalan",
//     noHP: "+6287852386596",
//     photo: "./assets/baby.jpg"
//   },
//   {
//     nama: "John Doe Evan Rafa Radya Alifian",
//     nim: "240411100063",
//     ttl: "Bangkalan 19 Oktober 2005",
//     alamat: "Bangkalan",
//     noHP: "+6287852386596",
//     photo: "./assets/baby.jpg"
//   },
//   {
//     nama: "John Doe Evan Rafa Radya Alifian",
//     nim: "240411100063",
//     ttl: "Bangkalan 19 Oktober 2005",
//     alamat: "Bangkalan",
//     noHP: "+6287852386596",
//     photo: "./assets/baby.jpg"
//   },
// ];

function friendListsElement() {
  const friendLists = document.getElementById("friend_list");
  const lists = `
    ${friendsData.map(data => `
      <li>
        <figure>
          <img src="${data.photo}" alt="Evan Rafa Radya Alifian" width="100%">
          <figcaption>
            <span>Nama : ${data.nama}</span>
            <span>NIM : ${data.nim}</span>
            <span>TTL : ${data.ttl}</span>
            <span>Alamat : ${data.alamat}</span>
            <span>NoHP : ${data.noHP}</span>
          </figcaption>
        </figure>
      </li>
    `).join("")}
  `;

  return friendLists.innerHTML = lists
}

friendListsElement()