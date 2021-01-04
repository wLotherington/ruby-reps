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

    centerPage: function() {
      this.$main.addClass('center');
    },

    addCodeMirrors: function() {
      this.cmCodes = [...document.getElementsByClassName('cm-code')].map(cmCode => {
        return CodeMirror(cmCode, {
          mode:  "ruby",
          theme: "monokai"
        });
      });

      this.cmReturns = [...document.getElementsByClassName('cm-return')].map(cmReturn => {
        return CodeMirror(cmReturn, {
          mode:  "none",
          theme: "monokai"
        });
      });
    },

    init: function() {
    },
  };

  const Reps = {
    init: function() {
      UI.centerPage();
      UI.addCodeMirrors();
    },
  };

  const CreateCards = {
    init: function() {
      UI.centerPage();
      UI.addCodeMirrors();
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

    initializePage: function() {
      switch (this.page) {
        case '/reps':
          Reps.init();
          break;
        case '/cards/new':
          CreateCards.init();
          break;
      }
    },

    init: function() {
      this.page = window.location.pathname;
      this.initializePage();
      this.bindEventListeners();
    },
  };

  App.init();
});