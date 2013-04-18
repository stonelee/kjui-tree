<tr class="grid-row" data-id="{{id}}" {{#if expanded}}data-status="expanded"{{/if}} {{#if leaf}}data-role="leaf"{{else}}data-role="expander"{{/if}}>
  <td class="grid-cell"{{#if treeColumnWidth}} width="{{treeColumnWidth}}"{{/if}} style="cursor:pointer;">
    {{#each icons}}<i class="icon icon-tree-{{this}}"></i>{{/each}}{{name}}
  </td>
  {{#each grids}}
    <td class="grid-cell" width="{{width}}"{{#if align}} style="text-align:{{align}};"{{/if}}>
      {{{value}}}
    </td>
  {{/each}}
</tr>
