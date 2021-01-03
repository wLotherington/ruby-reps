$(function() {
  const API = {
    logout: function() {
      $.ajax({
        url: '/logout',
        type: 'GET',
      }).done(function() {
        $(location).attr('href', '/');
      });
    },
  };

  const UI = {
    $loginButton: $('#login'),
    $main: $('main'),

    promptLogout: function() {
      let username = this.$loginButton.text();
      
      this.loginButtonMode('prompt-logout');
      this.$loginButton.addClass('logout');

      let count = 5

      this.$loginButton.html('Logout ' + username + "? " + count);

      this.countDown = setInterval(() => {
        count--;
        this.$loginButton.html('Logout ' + username + "? " + count);

        if (count <=0 ) {
          clearInterval(this.countDown);
          this.$loginButton.html(username);
          this.$loginButton.data('mode', 'logged-in');
          this.$loginButton.removeClass('logout');
        }
      }, 1000);
    },

    loginButtonMode: function(mode) {
      if (!!mode) {
        this.$loginButton.data('mode', mode);
      }

      return this.$loginButton.data('mode');
    },

    centerPages: function() {
      const pages = ['/reps', '/cards/new'];

      if (pages.indexOf(window.location.pathname) !== -1) {
        this.$main.addClass('center');
      } else {
        this.$main.removeClass('center');
      }
    },

    init: function() {
      this.centerPages();
    },
  };

  const App = {
    handleLoginButton: function(e) {
      if (UI.loginButtonMode() !== 'logged-out') {
        e.preventDefault();
      }

      if (UI.loginButtonMode() === 'logged-in') {
        UI.promptLogout();
      } else if (UI.loginButtonMode() == 'prompt-logout') {
        API.logout();
      }
    },

    bindEventListeners: function() {
      UI.$loginButton.on('click', e => this.handleLoginButton(e));
    },

    init: function() {
      this.bindEventListeners();
      UI.init();
    },
  };

  App.init();
});