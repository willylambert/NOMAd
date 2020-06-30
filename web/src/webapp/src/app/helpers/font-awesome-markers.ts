/*
 * Copyright (c) 2020 INSA Lyon (DISP LAB EA 4570), IMT Atlantique (LS2N LAB UMR CNRS), Ressourcial, SYNERGIHP and ODO Smart Systems
 *
 * This program has been developed in the context of the NOMAd project and is GPL v3 Licensed.
 * We would like to thank the European Union through the European regional development fund (ERDF) and the French region Auvergne-Rhône-Alpes for their financial support.
 * The following entities have been involved in the NOMAd project: INSA Lyon (DISP LAB EA 4570), IMT Atlantique (LS2N LAB UMR CNRS), Ressourcial, SYNERGIHP and Odo Smart System.
 *
 * This file is part of NOMAd.
 *
 * NOMAd is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * NOMAd is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with NOMAd.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Icon, IconOptions } from 'mapbox.js';
import * as L from 'mapbox.js';

export interface FontAwesomeOptions extends IconOptions {
  iconClasses?;
  iconColor?;
  iconXOffset?;
  iconYOffset?;
  icon?;
  markerColor?;
  shadowAnchor?;
  iconAnchor?;
  className?;
  iconSize?;
  text?;

}

export class FontAwesomeIcon extends Icon {
  options: FontAwesomeOptions;

  constructor(options: IconOptions) {

   if(!options.iconSize) options.iconSize = "fa-w-16";
   if(!options.iconAnchor) options.iconAnchor = [17, 42];
   if(!options.popupAnchor) options.popupAnchor = [1, -32];
   if(!options.shadowAnchor) options.shadowAnchor = [10, 12];
   if(!options.shadowSize) options.shadowSize = [36, 16];
   if(!options.className) options.className = 'awesome-marker';
   if(!options.markerColor) options.markerColor = 'blue';
   if(!options.iconColor) options.iconColor = 'white';
   if(!options.text) options.text = '';

   super(options);
  }

  createIcon() {
      var div = document.createElement('div'),
          options = this.options;

      if (this.options) {
          div.innerHTML = this.buildIcon(this.options.icon);
      }

      this._setIconStyles(div, 'icon-' + this.options.markerColor);
      return div;
  }

  _setIconStyles(img, name) {
      var options = this.options,
          size = L.point(options[name === 'shadow' ? 'shadowSize' : 'iconSize']),
          anchor;

      if (name === 'shadow') {
          anchor = L.point(options.shadowAnchor || options.iconAnchor);
      } else {
          anchor = L.point(options.iconAnchor);
      }

      if (!anchor && size) {
          anchor = size.divideBy(2, true);
      }

      img.className = 'awesome-marker-' + name + ' ' + options.className;

      if (anchor) {
          img.style.marginLeft = (-anchor.x) + 'px';
          img.style.marginTop  = (-anchor.y) + 'px';
      }

      if (size) {
          img.style.width  = size.x + 'px';
          img.style.height = size.y + 'px';
      }
  }

  /**
  * Convert Fa Icon
  **/
  private buildIcon(faIcon){
    var s;
    if(this.options.text!=''){
      s= "<div class='awesome-marker-text' style='color:"+this.options.iconColor+"'><strong>"+this.options.text+"</strong></div>"
    }
    else{
      s = "<svg class='awesome-marker-svg svg-inline--fa fa-"+faIcon.iconName+" " + this.options.iconSize + "' viewBox='0 0 512 512'><path fill='"+this.options.iconColor+"' d='"+faIcon.icon[4]+"'></path></svg>";
    }
    return s;
  }

  createShadow() {
      var div = document.createElement('div');

      this._setIconStyles(div, 'shadow');
      return div;
}
}