<tr class="grid-row" data-id="{{id}}" {{#if expanded}}data-status="expanded"{{/if}} {{#if leaf}}data-role="leaf"{{else}}data-role="expander"{{/if}}>
  <td class="grid-cell">
    {{#each icons}}<i class="icon-tree-{{this}}"></i>{{/each}}<span data-role="text" style="cursor:pointer;" class="unselectable">{{name}}</span>
  </td>
  {{#each grids}}
    <td class="grid-cell"{{#if align}} style="text-align:{{align}};"{{/if}}>
      {{{value}}}
    </td>
  {{/each}}
</tr>
