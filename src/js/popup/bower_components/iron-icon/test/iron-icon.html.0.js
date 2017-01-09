
function iconElementFor (node) {
  var nodes = Polymer.dom(node.root).childNodes;

  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i].nodeName.match(/DIV|IMG/)) {
      return nodes[i];
    }
  }
}

function hasIcon (node) {
  return /png/.test(node.style.backgroundImage);
}

suite('<iron-icon>', function() {
  suite('basic behavior', function() {
    var icon;

    setup(function() {
      icon = fixture('TrivialIcon');
    });

    test('can be assigned an icon with the src attribute', function() {
      expect(iconElementFor(icon)).to.be.ok;
      expect(iconElementFor(icon).src).to.match(/demo\/location\.png/);
    });

    test('can change its src dynamically', function() {
      icon.src = 'foo.png';

      expect(iconElementFor(icon).src).to.match(/foo\.png/);
    });
  });

  suite('lifecycle', function() {
    var icon;

    setup(function() {
      icon = document.createElement('iron-icon');
    });

    teardown(function() {
      if (icon.parentNode != null) {
        Polymer.dom(icon.parentNode).removeChild(icon);
      }
    });

    test('does not create icon until attached', function() {
      icon.src = 'location.png';

      var children = Polymer.dom(icon.root).querySelectorAll('img,svg');

      expect(children.length).to.be.eql(0);
      Polymer.dom(document.body).appendChild(icon);
      Polymer.dom.flush();
      children = Polymer.dom(icon.root).querySelectorAll('img,svg');
      expect(children.length).to.be.eql(1);
    });
  });

  suite('when paired with an iconset', function() {
    var icon;

    setup(function() {
      var elements = fixture('IconFromIconset');

      icon = elements[1];
    });

    test('can be assigned an icon from the iconset', function() {
      expect(hasIcon(icon)).to.be.ok;
    });

    test('can change its icon dynamically', function() {
      var style = icon.style;

      expect(style.backgroundPosition).to.match(/0(%|px) 0(%|px)/);

      icon.icon = "example:blank";

      expect(style.backgroundPosition).to.match(/-24px 0(%|px)/);
    });
  });

  suite('when no icon source is provided', function() {
    test('will politely wait for an icon source without throwing', function() {
      document.createElement('iron-icon');
      fixture('WithoutAnIconSource');
    });
  })

  suite('when loading async', function() {
    test('will get icon after iconset is added', function() {
      var icon = fixture('UsingAsyncIconset');
      expect(hasIcon(icon)).to.be.false;
      return new Promise(function(resolve, reject) {
        window.addEventListener('iron-iconset-added', function() {
          if (hasIcon(icon)) {
            resolve();
          } else {
            reject(new Error('icon didn\'t load after iconset loaded'));
          }
        });
        fixture('AsyncIconset');
      });
    });
  });

  suite('when switching between src and icon properties', function() {
    var icon;

    setup(function() {
      var elements = fixture('IconFromIconset');
      icon = elements[1];
    });

    test('will display the icon if both icon and src are set', function() {
      icon.src = '../demo/location.png';
      icon.icon = 'example:location';
      expect(hasIcon(icon)).to.be.true;
      expect(iconElementFor(icon)).to.not.exist;

      // Check if it works too it we change the affectation order
      icon.icon = 'example:location';
      icon.src = '../demo/location.png';
      expect(hasIcon(icon)).to.be.true;
      expect(iconElementFor(icon)).to.not.exist;
    });

    test('will display the icon when src is defined first and then reset', function() {
      icon.src = '../demo/location.png';
      icon.icon = null;
      icon.src = null;
      icon.icon = 'example:location';
      expect(hasIcon(icon)).to.be.true;
      expect(iconElementFor(icon)).to.not.exist;
    });

    test('will display the src when icon is defined first and then reset', function() {
      icon.src = null;
      icon.icon = 'example:location';
      icon.src = '../demo/location.png';
      icon.icon = null;
      expect(hasIcon(icon)).to.be.false;
      expect(iconElementFor(icon)).to.exist;
    });

    test('will display nothing if both properties are unset', function() {
      icon.src = '../demo/location.png';
      icon.icon = 'example:location';
      icon.src = null;
      icon.icon = null;
      expect(hasIcon(icon)).to.be.false;
      expect(iconElementFor(icon)).to.not.exist;
    });
  });
  suite('ancestor direct updates', function() {
    test('handle properties set before ready', function() {
      var holder = fixture('ParentForceUpdate');
    });
  });
});
  