<div class="mod" style="width:{{width}}px;">
  {{#if title}}
  <div class="hd unselectable">
    <span class="hd-title">{{title}}</span>
  </div>
  {{/if}}
  <div class="bd">

    {{#if fields}}
      <div class="grid-hd unselectable">
        <table><thead><tr>
          {{#each fields}}
            <th class="grid-cell" width="{{width}}">
              <span>{{header}}</span>
            </th>
          {{/each}}
        </tr></thead></table>
      </div>
    {{/if}}

    <div class="grid-bd"{{#if height}} style="height:{{height}}px"{{/if}}>
      <table class="grid-no-border"><tbody>

      </tbody></table>
    </div>

  </div>
</div>
