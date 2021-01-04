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

    runScript: function(code, fields) {
      $.ajax({
        url: '/script',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({code: code}),
      }).done(function(data) {
        fields.forEach(field => field.setValue(data));
      });
    },

    addCard: function(card) {
      $.ajax({
        url: '/cards',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(card),
      }).done(function(data) {
        CreateCards.clearSampleFields();
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
          readOnly: "nocursor",
          theme: "monokai"
        });
      });
    },

    init: function() {
    },
  };

  const Reps = {
    init: function() {
      UI.addCodeMirrors();
    },
  };

  const CreateCards = {
    $buttons: $('button'),
    $prompt: $('textarea'),
    $maskedPrompt: $('.masked-prompt'),

    createStarterCode: function() {
      let codePieces = this.code.split('#');
      let starterCode = codePieces[0] + "# Enter code here" + (codePieces[2] || '');
      let solutionCode = codePieces[1];

      UI.cmCodes[1].setValue(starterCode);
    },

    createPrompt: function() {
      let promptPieces = this.$prompt.val().replace(/\n/g, '<br>').split('$');
      let prompt = '<span class="hide show">' + promptPieces[1] + '</span>' + (promptPieces[2] || '')
      this.$maskedPrompt.html(prompt)
    },

    handleSubmitButton: function(e) {
      e.preventDefault();
      this.code = UI.cmCodes[0].getValue();

      API.runScript(this.code, UI.cmReturns);
      this.createStarterCode();
      this.createPrompt();
    },

    handleResetButton: function(e) {
      e.preventDefault();

      UI.cmReturns.forEach(cmReturn => cmReturn.setValue(''));
      UI.cmCodes.forEach(cmCode => cmCode.setValue(''));
      this.$prompt.val('Method: $$');
      this.$maskedPrompt.html('');
    },

    clearSampleFields: function() {
      UI.cmReturns[1].setValue('');
      UI.cmCodes[1].setValue('');
      this.$maskedPrompt.html('');
    },

    handleAddButton: function(e) {
      e.preventDefault();

      let card = {
        starterCode: UI.cmCodes[1].getValue(),
        solutionCode: UI.cmCodes[0].getValue().replace(/\n#/g, ''),
        prompt: this.$maskedPrompt.html().replace(" show", ''),
        solutionReturnValue: UI.cmReturns[0].getValue(),
      }

      API.addCard(card);
    },

    bindEventListeners: function() {
      this.$submitButton.on('click', e => this.handleSubmitButton(e));
      this.$resetButton.on('click', e => this.handleResetButton(e));
      this.$addButton.on('click', e => this.handleAddButton(e));
    },

    splitButtons: function() {
      this.$resetButton = this.$buttons.eq(0);
      this.$addButton = this.$buttons.eq(1);
      this.$submitButton = this.$buttons.eq(2);
    },

    init: function() {
      UI.addCodeMirrors();
      this.splitButtons();
      this.bindEventListeners();
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