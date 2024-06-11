let page;

let data;
document.addEventListener('DOMContentLoaded', function () {
  page = new Page(window);
});

class Page {
  constructor() {
    this.attachEvents();
    this.loadDataUser();
  }

  get(id) {
    return document.querySelector(id);
  }

  attachEvents() {
    // Agrega un evento de clic al botón de actualización si tienes uno
    const refreshButton = this.get('#refreshButton');
    if (refreshButton) {
      refreshButton.addEventListener('click', this.refresh.bind(this));
    }

    let btnLogout = this.get('#btnLogout');
    btnLogout.addEventListener('click', this.logout);
  }

  async loadDataUser() {
    let profileName = document.getElementById('nombreUser');
    try {
      const result = await window.ipcRender.invoke('getUserData');
      data = result;
      console.log(result)
      profileName.innerHTML = result.name;

    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  }


  refresh() {
    // Vuelve a cargar los datos del usuario
    this.loadDataUser();
  }

  logout() {
    window.ipcRender.send('logout', 'confirm-logout');
  }
}
